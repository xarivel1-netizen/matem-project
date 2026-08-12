CREATE TABLE `attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`task_id` integer NOT NULL,
	`answer_given` text NOT NULL,
	`is_correct` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `chapters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`number` integer NOT NULL,
	`title` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `day_paragraphs` (
	`day_id` integer NOT NULL,
	`paragraph_id` integer NOT NULL,
	PRIMARY KEY(`day_id`, `paragraph_id`),
	FOREIGN KEY (`day_id`) REFERENCES `days`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`paragraph_id`) REFERENCES `paragraphs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `days` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`day_number` integer NOT NULL,
	`title` text NOT NULL,
	`note` text,
	`is_locked` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `paragraphs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`chapter_id` integer NOT NULL,
	`number` integer,
	`title` text NOT NULL,
	`theory_md` text,
	FOREIGN KEY (`chapter_id`) REFERENCES `chapters`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`day_id` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`completed_at` text,
	FOREIGN KEY (`day_id`) REFERENCES `days`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`paragraph_id` integer NOT NULL,
	`kind` text NOT NULL,
	`statement_md` text NOT NULL,
	`options_json` text,
	`answer` text NOT NULL,
	`solution_md` text,
	`difficulty` integer NOT NULL,
	FOREIGN KEY (`paragraph_id`) REFERENCES `paragraphs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_attempts_task_id` ON `attempts` (`task_id`);--> statement-breakpoint
CREATE INDEX `idx_attempts_created_at` ON `attempts` (`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `chapters_number_unique` ON `chapters` (`number`);--> statement-breakpoint
CREATE INDEX `idx_day_paragraphs_day_id` ON `day_paragraphs` (`day_id`);--> statement-breakpoint
CREATE INDEX `idx_day_paragraphs_paragraph_id` ON `day_paragraphs` (`paragraph_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `days_day_number_unique` ON `days` (`day_number`);--> statement-breakpoint
CREATE INDEX `idx_paragraphs_chapter_id` ON `paragraphs` (`chapter_id`);--> statement-breakpoint
CREATE INDEX `idx_progress_day_id` ON `progress` (`day_id`);--> statement-breakpoint
CREATE INDEX `idx_tasks_paragraph_id` ON `tasks` (`paragraph_id`);