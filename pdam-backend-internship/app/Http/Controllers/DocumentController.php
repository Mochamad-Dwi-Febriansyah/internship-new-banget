<?php

namespace App\Http\Controllers;

use App\ApiResponse;
use App\Helpers\FileHelper;
use App\Helpers\LogHelper;
use App\Http\Requests\DocumentRequest;
use App\Models\Document;
use App\Models\Signature;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class DocumentController extends Controller
{
    use ApiResponse;
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $document = Document::paginate(20);

        LogHelper::log('document_index', 'Retrieved the list of documents successfully', null, ['total_documents' => $document->total()]);

        return $this->successResponse($document, 'Document list retrieved successfully', Response::HTTP_OK);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(DocumentRequest $documentRequest)
    {
        DB::beginTransaction();

        try {
            
            $uploadedFiles = $documentRequest->handleUploads();

            $document = Document::create(array_merge(
                $documentRequest->validated(),
                $uploadedFiles,
                ['user_id' => $documentRequest->user_id, 'school_university_id' => $documentRequest->school_university_id]
            ));

        DB::commit();

        LogHelper::log('document_store', 'Created a new document successfully', $document, [
            'document' => $document->id
        ]);

        // $data = [
        //     'data' => $document
        // ];

        return $this->successResponse(null, 'Document has been successfully created', Response::HTTP_CREATED);

        } catch (\Throwable $th) {
            DB::rollBack();
            LogHelper::log('document_store', 'Failed to create a new document', null, [], 'error');
            return $this->errorResponse($th->getMessage(), 'An error occurred while creating the document', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $document = Document::find($id);

        if(!$document)
        {
            return $this->errorResponse(null, 'Document not found', Response::HTTP_NOT_FOUND);
        }

        LogHelper::log('document_show', 'Viewed document details successfully', $document);

        return $this->successResponse($document, 'Document details retrieved successfully', Response::HTTP_OK);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(DocumentRequest $documentRequest, string $id) 
    { 

        DB::beginTransaction();

        try {
            $document = Document::find($id);

            if(!$document)
            {
                return $this->errorResponse(null, 'Document not found', Response::HTTP_NOT_FOUND);
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

            LogHelper::log('document_update', 'Document updated successfully', $document, [
                'updated_fields' => $documentData,
            ]);

            return $this->successResponse(null, 'Document has been successfully updated', Response::HTTP_OK);

        } catch (\Throwable $th) {
            DB::rollBack();
            LogHelper::log('document_update', 'Failed to update document', null, [], 'error');
            return $this->errorResponse($th->getMessage(), 'An error occurred while updating the document', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        DB::beginTransaction();

        try {
            $document = Document::find($id);

            if(!$document)
            {
                return $this->errorResponse(null, 'Document not found', Response::HTTP_NOT_FOUND);
            }

            $document->delete();

            DB::commit();

            LogHelper::log('document_destroy', 'Document deleted successfully', $document, [
                'deleted_document_id' => $document->id,
                'deleted_document_name' => $document->name
            ]);

            return $this->successResponse(null, 'Document has been successfully deleted', Response::HTTP_OK);
        } catch (\Throwable $th) {
            DB::rollBack();
            LogHelper::log('document_destroy', 'Failed to delete document', null, [], 'error');
            return $this->errorResponse($th->getMessage(), 'An error occurred while deleting the document', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    } 
    
    public function exportWorkCertificate(DocumentRequest $documentRequest, string $user_id)
    {
        $validator = Validator::make($documentRequest->all(), [
            'number_letter' => 'required|string|max:255',
            'passphrase'    => 'required|string|min:6',
        ]);
    
        if ($validator->fails()) {
            return $this->errorResponse($validator->errors(), 'Validasi gagal', Response::HTTP_UNPROCESSABLE_ENTITY);
        } 
        
        $document = Document::with('user','schoolUni')->where('user_id',$user_id)->first();

        if(!$document)
        {
            return $this->errorResponse(null, 'Document not found', Response::HTTP_NOT_FOUND);
        }
        DB::beginTransaction();
        try { 
            $signature = Signature::where('status', 'active')
            ->whereJsonContains('purposes', 'work_certificate')
            ->first();
// dd($signature);
           

            $data = [
                'document' => $document,
                'number_letter' => $documentRequest->number_letter,
            ]; 
            $data['signature'] = $signature;
            if (empty($document->schoolUni->school_major)) {
                $data['internship_status'] = 'university';
            } elseif (!empty($document->university_faculty) && !empty($document->university_program_study)) {
                $data['internship_status'] = 'student';
            } else {
                $data['internship_status'] = 'unknown';  
            }
            $data['start_date'] =  \Carbon\Carbon::parse($document->start_date)->translatedFormat('d F Y');
            $data['end_date'] = \Carbon\Carbon::parse( $document->end_date)->translatedFormat('d F Y');
            $data['date_now'] = \Carbon\Carbon::now()->translatedFormat('d F Y');
        // dd($document);
        $pdf = Pdf::loadView('pdf.work-certificate', ['result' => $data]);

        // return $pdf->download();
        // Simpan file ke storage/app/public/documents/work_certificate
        $pdfFilePath = FileHelper::savePdfToStorage($pdf, 'documents/work_certificate', 'public');
        
        // Cek passphrase
        if (empty($documentRequest->passphrase)) {
            return $this->errorResponse(null, 'Gagal menandatangani dokumen. Passphrase belum tersedia.', Response::HTTP_UNPROCESSABLE_ENTITY);
        }
        
        // Ambil nama file dari path
        $fileName = basename($pdfFilePath);
        
        // Buat URL publik (pastikan `php artisan storage:link` sudah dijalankan)
        $fileUrl = Storage::url("documents/work_certificate/{$fileName}");
        $document->work_certificate = $fileUrl;
        $document->save();
        
        return $this->successResponse([
            'file_name' => $fileName,
            'file_url' => asset($fileUrl),
        ], 'Daily reports list retrieved successfully', Response::HTTP_OK);

        return $this->successResponse($fileContent , 'Daily reports list retrieved successfully', Response::HTTP_OK);


        }catch (\Throwable $th) {
            DB::rollBack();
            LogHelper::log('document_destroy', 'Failed to delete document', null, [], 'error');
            return $this->errorResponse($th->getMessage(), 'An error occurred while deleting the document', Response::HTTP_INTERNAL_SERVER_ERROR);
        }

    }


}
