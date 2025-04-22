<?php

namespace App\Http\Controllers;

use App\ApiResponse;
use App\Helpers\FileHelper;
use App\Helpers\LogHelper;
use App\Http\Requests\DocumentRequest;
use App\Http\Requests\SchoolUniRequest;
use App\Http\Requests\UserRequest;
use App\Mail\MailSendRegistrationNumber;
use App\Models\Document;
use App\Models\SchoolUni;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class ApplicationController extends Controller
{
    use ApiResponse;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        $query = Document::with([
            'user:id,name,email,nisn_npm_nim', // Ambil hanya kolom yang diperlukan
            'user.roles:id,name',
            'schoolUni:id,school_university_name,school_major,university_faculty,university_program_study'
        ]);

        // Filter berdasarkan status jika ada query parameter
        if ($request->has('status') && in_array($request->status, ['pending', 'accepted', 'rejected'])) {
            $query->where('document_status', $request->status);
        }

        $documents = $query->paginate(20);

        $documents->getCollection()->transform(function ($doc) {
            $user = $doc->user;
        
            // Ambil role pertama (karena Spatie bisa multi-role)
            $user->role = $user->roles->first()?->name;
        
            // Hapus properti roles supaya tidak ikut di response
            unset($user->roles);
        
            return $doc;
        });

        LogHelper::log('application_index', 'Retrieved application list', null, [
            'status' => $request->status ?? 'all',
            'total_documents' => $documents->total()
        ]);

        return $this->successResponse($documents, 'Application list retrieved successfully', Response::HTTP_OK);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(UserRequest $userRequest, SchoolUniRequest $schoolUniRequest, DocumentRequest $documentRequest)
    {
        // dd([$userRequest, $schoolUniRequest, $documentRequest]);
        DB::beginTransaction();

        try {
            $schoolUni = SchoolUni::firstOrCreate(
                [
                    'school_university_email' => $schoolUniRequest->school_university_email,
                ],
                $schoolUniRequest->validated()
            );

            $user = User::create(array_merge(
                $userRequest->validated(),
                ['password' => Hash::make('123456')]
            ));
            // dd(get_class($user)); // Seharusnya "App\Models\User"

            // dd($user);
            $user->assignRole($userRequest->role); // <-- Ini assign role

            $uploadedFiles = $documentRequest->handleUploads();
 
            $document = Document::create(array_merge(
                $documentRequest->validated(),
                $uploadedFiles,
                ['user_id' => $user->id, 'school_university_id' => $schoolUni->id]
            ));

            DB::commit();

            Mail::to($userRequest->email)->send(new MailSendRegistrationNumber($document->registration_number, $userRequest->role));

            LogHelper::log('application_store', 'Created a new application successfully', $document, [
                'user' => $user->only(['id', 'name', 'email']),
                'school_uni' => $schoolUni->only(['id', 'school_university_name']),
                'document_id' => $document->id,
            ]);

            // $data = [
            //     'user' => $user,
            //     'school_uni' => $schoolUni,
            //     'document' => $document
            // ];

            return $this->successResponse(null, 'Application has been successfully created', Response::HTTP_CREATED);
        } catch (\Throwable $th) {
            DB::rollBack();
            LogHelper::log('application_store', 'Failed to create a new application', null, [], 'error');
            return $this->errorResponse($th->getMessage(), 'An error occurred while creating the application', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $document = Document::with('user', 'schoolUni')->where('id', $id)->first();

        if (!$document) {
            return $this->errorResponse(null, 'Document not found', Response::HTTP_NOT_FOUND);
        }

        LogHelper::log('appication_show', 'Viewed application details successfully', $document);

        return $this->successResponse($document, 'Application details retrieved successfully', Response::HTTP_OK);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UserRequest $userRequest, SchoolUniRequest $schoolUniRequest, DocumentRequest $documentRequest, string $id)
    {
        DB::beginTransaction();

        try {
            $document = Document::with('user', 'schoolUni')->find($id);


            if (!$document) {
                return $this->errorResponse(null, 'Document not found', Response::HTTP_NOT_FOUND);
            }

            $user = $document->user;
            $schoolUni = $document->schoolUni;

            if (!$user) {
                return $this->errorResponse(null, 'User not found for this document', Response::HTTP_NOT_FOUND);
            }

            if (!$schoolUni) {
                return $this->errorResponse(null, 'School/University not found for this document', Response::HTTP_NOT_FOUND);
            }

            $schoolUniData = array_filter($schoolUniRequest->validated(), fn($value) => $value !== null);

            if (!empty($schoolUniData)) {
                $schoolUni->fill($schoolUniData)->save();
            }

            $userData = array_filter($userRequest->validated(), fn($value) => $value !== null);
            if (!empty($userData['password'])) {
                $userData['password'] = Hash::make($userData['password']);
            }

            if (!empty($userData)) {
                $user->fill($userData)->save();
            }

            $uploadedFiles = [];
            $fileFields = ['identity_photo', 'application_letter', 'work_certificate'];

            foreach ($fileFields as $field) {
                if ($documentRequest->hasFile($field)) {
                    FileHelper::deleteFile($document->$field);
                    $uploadedFiles[$field] = FileHelper::uploadFile($documentRequest->file($field), 'documents');
                } else {
                    $uploadedFiles[$field] = $document->$field; // Tetap gunakan file lama jika tidak ada upload baru
                }
            }

            $documentData = array_filter($documentRequest->validated(), fn($value) => $value !== null);
            $mergedDocumentData = array_merge($documentData, $uploadedFiles);



            if (!empty($mergedDocumentData)) {
                $document->fill($mergedDocumentData);
                // Log::info('Updated Document:', $document->toArray());
                $document->save();
            }

            DB::commit();

            LogHelper::log('appication_update', 'Application updated successfully', $document, [
                'updated_fields' => $mergedDocumentData,
            ]);

            // $data = [
            //     'user' => $user,
            //     'school_uni' => $schoolUni,
            //     'document' => $document
            // ];  

            return $this->successResponse(null, 'Application has been successfully updated', Response::HTTP_OK);
        } catch (\Throwable $th) {
            DB::rollBack();
            LogHelper::log('appication_update', 'Failed to update appication', null, [], 'error');
            return $this->errorResponse($th->getMessage(), 'An error occurred while updating appication', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        DB::beginTransaction();

        try {
            $document = Document::where('id', $id)->first();

            if (!$document) {
                return $this->errorResponse(null, 'Document not found', Response::HTTP_NOT_FOUND);
            }

            $user = $document->user;
            $schoolUni = $document->schoolUni;

            $fileFields = ['identity_photo', 'application_letter', 'accepted_letter', 'work_certificate'];

            foreach ($fileFields as $field) {
                if (!empty($document->$field)) {
                    FileHelper::deleteFile($document->$field);
                }
            }

            $document->delete();

            if ($user && !$user->documents()->exists()) {
                $user->delete();
            }

            if ($schoolUni && !$schoolUni->documents()->exists()) {
                $schoolUni->delete();
            }

            DB::commit();

            LogHelper::log('application_destroy', 'Application deleted successfully', $document);

            return $this->successResponse(null, 'Application has been successfully deleted', Response::HTTP_OK);
        } catch (\Throwable $th) {
            DB::rollBack();
            LogHelper::log('document_destroy', 'Failed to delete application', null, [], 'error');
            return $this->errorResponse($th->getMessage(), 'An error occurred while deleting the application', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function checkStatus(string $id)
    {
        if (!preg_match('/^BR-\d{6}-[A-Z0-9]+$/', $id)) {
            return $this->errorResponse(null, 'Invalid registration number format', Response::HTTP_BAD_REQUEST);
        }

        $document = Document::with(['user:id,name,email'])->where('registration_number', $id)->select('document_status', 'registration_number', 'user_id')->first();

        if (!$document) {
            return $this->errorResponse(null, 'Document not found', Response::HTTP_NOT_FOUND);
        }

        LogHelper::log('appication_check_status', 'Checked appication status successfully', $document);

        return $this->successResponse($document, 'Application status retrieved successfully', Response::HTTP_OK);
    }

    public function getMenteesByMentor(Request $request)
    {
        $mentorId = $request->user_sso_id;

        if (!$mentorId) {
            return $this->errorResponse(null, 'Mentor ID is missing', Response::HTTP_BAD_REQUEST);
        }

        $perPage = $request->input('per_page', 1); // Mendapatkan parameter 'per_page' dari request, default 1
        $applications = Document::with('user', 'schoolUni')
            ->where('mentor_id', $mentorId)
            ->paginate($perPage);

        // Mapping data untuk mengambil informasi yang dibutuhkan
        $mentees = $applications->map(function ($application) {
            return [
                'name' => $application->user->name,
                'email' => $application->user->email,
                'nisn_npm_nim' => $application->user->nisn_npm_nim,
                'start_date' => $application->start_date,
                'end_date' => $application->end_date,
                'school_university_name' => $application->schoolUni->school_university_name ?? null,
                'school_major' => $application->schoolUni->school_major ?? null,
                'university_faculty' => $application->schoolUni->university_faculty ?? null,
                'university_program_study' => $application->schoolUni->university_program_study ?? null,
            ];
        });

        // Menggunakan pagination helper dan mengirimkan response
        $pagination = $this->paginationData($applications, $mentees);

        return $this->successResponse(null, 'Mentees list retrieved successfully', Response::HTTP_OK, $pagination);
    }

    public function updateStatusAndMentor(Request $request, $id)
    {
   
        DB::beginTransaction();
        try {
            $validator = Validator::make($request->all(),[
                'document_status' => 'required|in:accepted,pending,rejected',
                'mentor_id' => 'nullable', 
            ]);

            if($validator->fails())
            {
                return $this->errorResponse($validator->errors(), 'Validation error', Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $document = Document::find($id);

            if(!$document)
            {
                return $this->errorResponse(null, 'Document not found', Response::HTTP_NOT_FOUND);
            }
    
            $updateData = array_filter([
                'document_status' => $request->document_status,
                'mentor_id' => $request->mentor_id,
                'mentor_name' => $request->mentor_name, 
                'mentor_rank_group' => $request->mentor_rank_group, 
                'mentor_position' => $request->mentor_position, 
                'mentor_nik' => $request->mentor_nik ?? null,  
            ], fn($value) => $value !== null && $value !== '');
            
            $document->update($updateData);
     
            DB::commit();

            LogHelper::log('document_update', 'Updated document status and mentor successfully', $document, [
                'status' => $document->document_status,
                'mentor_id' => $document->mentor_id,
                'mentor_name' => $document->mentor_name, 
                'mentor_rank_group' => $document->mentor_rank_group, 
                'mentor_position' => $document->mentor_position, 
                'mentor_nik' => $document->mentor_nik ?? null,  
            ]);

            return $this->successResponse(null, 'Document has been successfully updated', Response::HTTP_OK);

        } catch (\Throwable $th) {
            DB::rollBack();
            LogHelper::log('document_update_status_and_mentor', 'Failed to update document', null, [], 'error');
            return $this->errorResponse($th->getMessage(), 'An error occurred while updating the document', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function submissionReceipt(Request $request, $id)
    {
        $document = Document::find($id);

        if(!$document)
        {
            return $this->errorResponse(null, 'Document not found', Response::HTTP_NOT_FOUND);
        }

        if ($document->document_status != 'accepted') {
            return $this->errorResponse(null, 'Document has not been approved', Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        $submissionReceiptValidator = Validator::make($request->all(), [  
            // 'status_berkas' => 'required',  
            // 'status_magang' => 'required|in:mahasiswa,siswa',   
            'name' => 'required',
            'school_major' => 'nullable',
            'university_program_study' => 'nullable',
            'nisn_npm_nim' => 'required',
            'date_document' => 'required',
            'number_document' => 'required',
            'nature' => 'nullable',
            'attachment' => 'nullable', 
            'recipient' => 'required|string',
            'recipient_address' => 'required|string',
            'recipient_date' => 'required|date',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'passphrase' => 'required',
        ]); 

        if($submissionReceiptValidator->fails())
        {
            return $this->errorResponse($submissionReceiptValidator->errors(), 'Validation error', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        DB::beginTransaction();
        try {
            $dateFields = ['date_document', 'recipient_date', 'start_date', 'end_date'];

            $data = []; // Initialize the data array
        
            // Loop through each date field
            foreach ($dateFields as $field) {
                if (!empty($request->$field)) {
                    // Check if the input contains the day (e.g., "Wednesday, 12 March 2025")
                    if (strpos($request->$field, ',') !== false) {
                        // If there's a day, take the part after the comma
                        $date = trim(explode(',', $request->$field)[1]);
                    } else {
                        // If no day, use it directly
                        $date = trim($request->$field); // e.g., "2025-12-02"
                    }
        
                    // If the format is yyyy-mm-dd (from input type="date"), parse it directly
                    if (preg_match('/\d{4}-\d{2}-\d{2}/', $date)) {
                        $carbonDate = Carbon::parse($date);
                    } else {
                        // If the format is "12 March 2025", make sure the month is converted to English for parsing
                        $indonesianMonths = [
                            'Januari' => 'January',
                            'Februari' => 'February',
                            'Maret' => 'March',
                            'April' => 'April',
                            'Mei' => 'May',
                            'Juni' => 'June',
                            'Juli' => 'July',
                            'Agustus' => 'August',
                            'September' => 'September',
                            'Oktober' => 'October',
                            'November' => 'November',
                            'Desember' => 'December',
                        ];
                        $englishDate = strtr($date, $indonesianMonths); // Convert month to English
                        $carbonDate = Carbon::createFromFormat('d F Y', $englishDate);
                    }
        
                    // Set locale and format back to "d F Y"
                    Carbon::setLocale('en');
                    $data[$field] = $carbonDate->translatedFormat('d F Y'); // e.g., "02 December 2025"
                } else {
                    $data[$field] = '......'; // Default if empty
                }
            }
        
            // Set document status
            $data['document_status'] = $document->document_status ?? '......'; // Default if empty
        
            // Set internship status (student or university)
            if (empty($document->school_major)) {
                $data['internship_status'] = 'university';
            } elseif (!empty($document->university_faculty) && !empty($document->university_program_study)) {
                $data['internship_status'] = 'student';
            } else {
                $data['internship_status'] = 'unknown'; // Fallback if no condition matches
            }
        
            // Generate PDF using updated data
            $data = array_merge($data, $request->all());
            // dd($data);

            $pdfContent = Pdf::loadView('pdf.submission_receipt', ['result' => $data]);

        $pdfFileName = 'surat_terima_x_' . time() . '.pdf';

        // Pastikan folder ada
        $pdfFolder = storage_path('app/public/berkas/'. $pdfFileName);
        if (!file_exists(storage_path('app/public/berkas'))) {
            mkdir(storage_path('app/public/berkas'), 0777, true);
        }

        // Simpan PDF ke local storage 
        file_put_contents($pdfFolder, $pdfContent->output());
        
        // return response()->json(['message' => 'Submission receipt successfully created', 'file_path' => $pdfFileName, 'real' => storage_path('app/public/berkas/' . $pdfFileName)], Response::HTTP_INTERNAL_SERVER_ERROR);

        // Tanda tangani dengan BSrE
        $signedPdfResponse = $this->signWithBsre(realpath(storage_path('app/public/berkas/' . $pdfFileName)), $pdfFileName, '1234567890123456', $request->passphrase);

        // Path file signed yang disimpan
        // $signedPdfFileName = 'signed_' . $pdfFileName;
        // $signedRelativePath = 'documents/berkas/' . $signedPdfFileName;

        // Simpan path ke database
        $document->update([
            'accepted_letter' => $signedPdfResponse->original
        ]);


            DB::commit();
        
            return response()->json(['message' => 'Submission receipt successfully created', 'file_path' => $signedPdfResponse->original], Response::HTTP_OK);
        } catch (\Throwable $th) {
        //     'errors' => $th->getMessage(), // tampilkan error detail
        // 'trace' => $th->getTraceAsString(), // opsional: untuk debug trace
            DB::rollBack();
            LogHelper::log('submission_receipt_store', 'Failed to create a new submission receipt', null, [], 'error');
            return $this->errorResponse($th->getTraceAsString(), 'An error occurred while creating the submission receipt', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    private function signWithBsre($pdfPath, $pdfFileName, $nik, $passphrase){
        
        $client = new Client();
        // $bsreUrl = 'http://103.101.52.82/api/sign/pdf';
        $bsreUrl = config('services.bsre.url').'/api/sign/pdf'; 
        try { 
            
            $response = $client->request('POST', $bsreUrl, [
                'headers' => [
                    'Authorization' => 'Basic ' . base64_encode(config('services.bsre.username') . ':' . config('services.bsre.password')),
                    'Accept' => 'application/json',
                ], 
                'multipart' => [
                    [
                        'name' => 'file',
                        'contents' => fopen($pdfPath, 'r'),
                        'filename' => $pdfFileName
                    ],
                    [
                        'name' => 'nik',
                        'contents' => $nik
                    ],
                    [
                        'name' => 'passphrase',
                        'contents' => $passphrase
                    ],
                    [
                        'name' => 'tampilan',
                        'contents' => 'visible'
                    ],
                    [
                        'name' => 'linkQR',
                        'contents' => config('services.bsre.linkqr').$nik
                    ],
                    [
                        'name' => 'tag_koordinat',
                        'contents' => '#'
                    ],
                    [
                        'name' => 'width',
                        'contents' => '100'
                    ],
                    [
                        'name' => 'height',
                        'contents' => '100'
                    ],
                ],

            ]); 
            $signedPdfPath = storage_path('app/public/berkas/signed_' . $pdfFileName);
            file_put_contents($signedPdfPath, $response->getBody()->getContents());
            return response()->json('signed_'.$pdfFileName); 
        } catch (RequestException $e) {
            $responseBody = $e->hasResponse() ? $e->getResponse()->getBody()->getContents() : null;

            LogHelper::log('bsre_signing_error', 'BSrE signing request failed', null, [
                'message' => $e->getMessage(),
                'response' => $responseBody,
            ], 'error');
        
            // Buat respons error yang lebih ramah
            throw new HttpResponseException(response()->json([
                'message' => 'Gagal menandatangani dokumen dengan BSrE',
                'error' => $e->getMessage(),
                'details' => $responseBody,
            ], 500));
        }
    }
}
