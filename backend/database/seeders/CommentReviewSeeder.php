<?php

namespace Database\Seeders;

use App\Models\Review;
use App\Models\ReviewImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class CommentReviewSeeder extends Seeder
{
	public function run(): void
	{
		$commentsDir = base_path('../frontend/Public/comments');

		if (! File::isDirectory($commentsDir)) {
			return;
		}

		$files = File::files($commentsDir);
		if (empty($files)) {
			return;
		}

		foreach ($files as $file) {
			$extension = strtolower($file->getExtension());
			if (! in_array($extension, ['jpg', 'jpeg', 'png', 'webp'], true)) {
				continue;
			}

			$filename = $file->getFilename();
			$rawName = pathinfo($filename, PATHINFO_FILENAME);
			$cleanName = Str::of($rawName)
				->replace(['_', '-'], ' ')
				->squish()
				->title();

			$review = Review::create([
				'product_id'    => null,
				'order_number'  => null,
				'reviewer_name' => (string) $cleanName,
				'rating'        => random_int(4, 5),
				'body'          => null,
				'is_approved'   => true,
				'approved_at'   => now(),
			]);

			ReviewImage::firstOrCreate([
				'review_id' => $review->id,
				'url'       => '/comments/' . $filename,
			]);
		}
	}
}
