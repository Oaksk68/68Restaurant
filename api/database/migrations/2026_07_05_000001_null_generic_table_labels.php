<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Clear auto-generated English labels like "Table 1" so the UI can render
     * a localized table name. Genuine custom labels are left untouched.
     */
    public function up(): void
    {
        DB::table('restaurant_tables')
            ->whereRaw("label = 'Table ' || number")
            ->update(['label' => null]);
    }

    public function down(): void
    {
        // Restore the previous generic labels for any table without a custom one.
        DB::table('restaurant_tables')
            ->whereNull('label')
            ->update(['label' => DB::raw("'Table ' || number")]);
    }
};
