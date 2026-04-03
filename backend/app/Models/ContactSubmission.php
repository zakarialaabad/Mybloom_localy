<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactSubmission extends Model
{
    use HasFactory;

    protected $table = 'contact_submissions';

    protected $fillable = [
        'visitor_name',
        'visitor_phone',
        'visitor_subject',
        'visitor_message',
        'email_sent',
    ];

    protected function casts(): array
    {
        return [
            'email_sent' => 'boolean',
        ];
    }
}
