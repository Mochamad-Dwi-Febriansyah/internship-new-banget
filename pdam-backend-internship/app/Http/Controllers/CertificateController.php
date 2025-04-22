<?php

namespace App\Http\Controllers;

use App\ApiResponse;
use App\Helpers\LogHelper;
use App\Http\Requests\CertificateRequest;
use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Tymon\JWTAuth\Facades\JWTAuth;

class CertificateController extends Controller
{
    use ApiResponse;
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = JWTAuth::parseToken()->authenticate();

        $certificate = Certificate::where('user_id', $user->id)->paginate(20);

        LogHelper::log('certificate_index', 'Retrieved the list of certificate successfully', null, ['total_certificate' => $certificate->total()]);

        return $this->successResponse($certificate, 'Certificate list retrieved successfully', Response::HTTP_OK);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CertificateRequest $certificateRequest)
    {
        DB::beginTransaction();
        try {
            // Simpan sertifikat
            $certificate = Certificate::create($certificateRequest->validated());

            // Simpan fields jika ada
            if ($certificateRequest->has('fields')) {
                foreach ($certificateRequest->fields as $field) {
                    $certificate->fields()->create([
                        'certificate_id' => $certificate->id,
                        'assessment_aspects_id' => $field['assessment_aspects_id'],
                        'score' => $field['score'] ?? null,
                        'status' => $field['status'] ?? 'active',
                    ]);
                }
            }

            DB::commit();
 
            LogHelper::log('certificate_store', 'Created a new certificate successfully', $certificate, [
                'certificate_id' => $certificate->id
            ]);

            $data = [
                'data' => $certificate->load('fields')
            ];

            return $this->successResponse($data, 'Certificate has been successfully created', Response::HTTP_CREATED);
        } catch (\Throwable $th) {
            DB::rollBack();

            // Logging error
            LogHelper::log('certificate_store', 'Failed to create a new certificate', null, [], 'error');

            return $this->errorResponse($th->getMessage(), 'An error occurred while creating the certificate', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
 
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $certificate = Certificate::find($id);

        if(!$certificate)
        {
            return $this->errorResponse(null, 'Certificate not found', Response::HTTP_NOT_FOUND);
        }

        LogHelper::log('certificate_show', 'Viewed certificate details successfully', $certificate);

        return $this->successResponse($certificate, 'Certificate details retrieved successfully', Response::HTTP_OK);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        DB::beginTransaction();
    
        try { 
            $certificate = Certificate::find($id);
    
            if(!$certificate) {
                return $this->errorResponse(null, 'Certificate not found', Response::HTTP_NOT_FOUND);
            }
     
            $certificate->update($request->validated());
     
            if ($request->has('fields')) {
                foreach ($request->fields as $field) { 
                    $certificateField = $certificate->fields()->where('assessment_aspects_id', $field['assessment_aspects_id'])->first();
    
                    if ($certificateField) {
                        // Jika field sudah ada, update dengan data baru
                        $certificateField->update([
                            'score' => $field['score'] ?? $certificateField->score,
                            'status' => $field['status'] ?? $certificateField->status,
                        ]);
                    } else { 
                        $certificate->fields()->create([
                            'certificate_id' => $certificate->id,
                            'assessment_aspects_id' => $field['assessment_aspects_id'],
                            'score' => $field['score'] ?? null,
                            'status' => $field['status'] ?? 'active',
                        ]);
                    }
                }
            }
    
            DB::commit();
     
            LogHelper::log('certificate_update', 'Updated the certificate successfully', $certificate, [
                'certificate_id' => $certificate->id
            ]);
     
            $data = [
                'data' => $certificate->load('fields')
            ];
    
            return $this->successResponse($data, 'Certificate has been successfully updated', Response::HTTP_OK);
    
        } catch (\Throwable $th) {
            DB::rollBack();
    
            // Log error
            LogHelper::log('certificate_update', 'Failed to update certificate', null, [], 'error');
    
            return $this->errorResponse($th->getMessage(), 'An error occurred while updating the certificate', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        DB::beginTransaction();

        try {
            $certificate = Certificate::find($id);

            if(!$certificate)
            {
                return $this->errorResponse(null, 'Certificate not found', Response::HTTP_NOT_FOUND);
            }

            $certificate->delete();

            DB::commit();

            LogHelper::log('certificate_destroy', 'Certificate deleted successfully', $certificate, [
                'deleted_certificate_id' => $certificate->id,
                'deleted_certificate_name' => $certificate->name
            ]);

            return $this->successResponse(null, 'Certificate has been successfully deleted', Response::HTTP_OK);
        } catch (\Throwable $th) {
            DB::rollBack();
            LogHelper::log('certificate_destroy', 'Failed to delete certificate', null, [], 'error');
            return $this->errorResponse($th->getMessage(), 'An error occurred while deleting the certificate', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
