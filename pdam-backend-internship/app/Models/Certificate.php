<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Certificate extends Model
{
    protected $table = 'certificates';
    protected $fillable = [
        'user_id',
        'document_id',
        'certificate_number',
        'total_score',
        'average_score',
        'certificate_path',
        'status',
        'issued_at',
    ];
}
