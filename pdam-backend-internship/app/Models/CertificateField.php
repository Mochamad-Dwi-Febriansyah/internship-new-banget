<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CertificateField extends Model
{
    protected $table = 'certificate_fields';
    protected $fillable = [
        'certificate_id',
        'assessment_aspects_id',
        'score',
        'status'
    ];
}
