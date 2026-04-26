-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 25, 2026 at 01:03 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `nexus_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `action` varchar(255) NOT NULL,
  `details` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `details`, `created_at`) VALUES
(1, 2, 'registered', 'New account', '2026-04-16 12:08:44'),
(2, 3, 'registered', 'New account', '2026-04-16 12:08:44'),
(3, 4, 'registered', 'New account', '2026-04-16 12:08:44'),
(4, 5, 'registered', 'New account', '2026-04-16 12:08:44'),
(5, 6, 'registered', 'New account', '2026-04-16 12:08:44'),
(6, 7, 'registered', 'New account', '2026-04-16 12:08:44'),
(7, 2, 'logged_in', NULL, '2026-04-16 12:08:44'),
(8, 3, 'logged_in', NULL, '2026-04-16 12:08:44'),
(9, 2, 'created_post', 'Post #1', '2026-04-16 12:08:44'),
(10, 3, 'created_post', 'Post #2', '2026-04-16 12:08:44'),
(11, 4, 'created_post', 'Post #3', '2026-04-16 12:08:44'),
(12, 5, 'created_post', 'Post #4', '2026-04-16 12:08:44'),
(13, 6, 'created_post', 'Post #5', '2026-04-16 12:08:44'),
(14, 7, 'uploaded_video', 'Video #1', '2026-04-16 12:08:44'),
(15, 2, 'logged_in', '', '2026-04-16 12:10:28'),
(16, 2, 'uploaded_file', 'image: nx_69e0d34e79eb32.67589519_2.png', '2026-04-16 12:17:18'),
(17, 2, 'created_story', 'Story #1', '2026-04-16 12:17:39'),
(18, 2, 'uploaded_file', 'image: nx_69e0d39b8a4638.66372762_2.png', '2026-04-16 12:18:35'),
(19, 1, 'banned_user', 'User #8', '2026-04-16 12:46:18'),
(20, 1, 'uploaded_file', 'image: nx_69e0dbdcd68789.97499961_1.png', '2026-04-16 12:53:48'),
(21, 2, 'logged_in', '', '2026-04-16 13:00:16'),
(22, 2, 'sent_message', '', '2026-04-16 13:01:11'),
(23, 2, 'sent_message', '', '2026-04-16 13:01:40'),
(24, 2, 'uploaded_file', 'image: nx_69e0de0d0ff589.00910557_2.png', '2026-04-16 13:03:09'),
(25, 2, 'logged_in', '', '2026-04-17 05:34:16'),
(26, 2, 'logged_in', '', '2026-04-19 06:39:55'),
(27, 2, 'created_post', 'Post #16', '2026-04-19 06:51:41'),
(28, 12, 'registered', '', '2026-04-25 10:56:46');

-- --------------------------------------------------------

--
-- Table structure for table `appearance_prefs`
--

CREATE TABLE `appearance_prefs` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `font_size` varchar(10) DEFAULT 'medium',
  `accent_color` varchar(20) DEFAULT 'cyan',
  `bubble_style` varchar(20) DEFAULT 'rounded',
  `bg_wallpaper` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `archived_conversations`
--

CREATE TABLE `archived_conversations` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `conversation_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blocked_users`
--

CREATE TABLE `blocked_users` (
  `blocker_id` bigint(20) UNSIGNED NOT NULL,
  `blocked_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bookmarks`
--

CREATE TABLE `bookmarks` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `post_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `post_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `post_id`, `user_id`, `content`, `created_at`) VALUES
(1, 1, 3, 'Absolutely stunning! What camera are you shooting on?', '2026-04-16 12:08:44'),
(2, 1, 4, 'The colours in this! 😍 Would love to see a full gallery.', '2026-04-16 12:08:44'),
(3, 2, 4, 'Agree 100%. Every line of code is a liability. Write less, do more.', '2026-04-16 12:08:44'),
(4, 3, 3, 'This is the kind of ROI data that makes clients actually listen. Well done!', '2026-04-16 12:08:44'),
(5, 5, 2, 'Congratulations! First revenue is the sweetest. Keep going! 🎉', '2026-04-16 12:08:44'),
(6, 5, 7, 'Proud of you bro! The grind pays off.', '2026-04-16 12:08:44'),
(7, 6, 10, 'This is the work. Real change happens in classrooms like yours. 🙌', '2026-04-16 12:08:44'),
(8, 6, 8, 'I remember my first coding lesson. It changed my life. You are changing theirs.', '2026-04-16 12:08:44'),
(9, 7, 3, 'Cannot wait for Friday! Afrobeats + jazz is a wild combo.', '2026-04-16 12:08:44'),
(10, 9, 2, 'Incredible! I want to do this ride. How long did it take?', '2026-04-16 12:08:44'),
(11, 10, 6, 'Sharing this everywhere. Thank you for speaking up consistently. 🌱', '2026-04-16 12:08:44'),
(12, 4, 3, 'My designer just sent me this thread. She is telling me to stop using clashing colours 😂', '2026-04-16 12:08:44'),
(13, 13, 2, 'So true. Met my best business partner at a random meetup.', '2026-04-16 12:08:44'),
(14, 14, 4, 'Will there be an online stream? Can we join from Capetown?', '2026-04-16 12:08:44');

-- --------------------------------------------------------

--
-- Table structure for table `conversations`
--

CREATE TABLE `conversations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `conversations`
--

INSERT INTO `conversations` (`id`, `created_at`) VALUES
(1, '2026-04-16 13:01:11');

-- --------------------------------------------------------

--
-- Table structure for table `conversation_participants`
--

CREATE TABLE `conversation_participants` (
  `conversation_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `conversation_participants`
--

INSERT INTO `conversation_participants` (`conversation_id`, `user_id`) VALUES
(1, 2),
(1, 6);

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `creator_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `location` varchar(300) DEFAULT NULL,
  `cover` varchar(255) DEFAULT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `is_online` tinyint(1) DEFAULT 0,
  `max_attendees` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event_attendees`
--

CREATE TABLE `event_attendees` (
  `event_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('going','interested','not_going') DEFAULT 'going'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `follows`
--

CREATE TABLE `follows` (
  `follower_id` bigint(20) UNSIGNED NOT NULL,
  `following_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `follows`
--

INSERT INTO `follows` (`follower_id`, `following_id`, `created_at`) VALUES
(1, 4, '2026-04-16 12:52:24'),
(2, 3, '2026-04-16 12:08:44'),
(2, 4, '2026-04-16 12:08:44'),
(2, 6, '2026-04-16 12:08:44'),
(2, 7, '2026-04-16 12:08:44'),
(2, 10, '2026-04-16 12:08:44'),
(3, 2, '2026-04-16 12:08:44'),
(3, 4, '2026-04-16 12:08:44'),
(3, 5, '2026-04-16 12:08:44'),
(3, 8, '2026-04-16 12:08:44'),
(4, 2, '2026-04-16 12:08:44'),
(4, 3, '2026-04-16 12:08:44'),
(4, 6, '2026-04-16 12:08:44'),
(4, 10, '2026-04-16 12:08:44'),
(5, 2, '2026-04-16 12:08:44'),
(5, 3, '2026-04-16 12:08:44'),
(5, 7, '2026-04-16 12:08:44'),
(6, 2, '2026-04-16 12:08:44'),
(6, 4, '2026-04-16 12:08:44'),
(6, 8, '2026-04-16 12:08:44'),
(6, 10, '2026-04-16 12:08:44'),
(7, 2, '2026-04-16 12:08:44'),
(7, 3, '2026-04-16 12:08:44'),
(7, 5, '2026-04-16 12:08:44'),
(7, 6, '2026-04-16 12:08:44'),
(8, 4, '2026-04-16 12:08:44'),
(8, 6, '2026-04-16 12:08:44'),
(8, 10, '2026-04-16 12:08:44'),
(9, 2, '2026-04-16 12:08:44'),
(9, 5, '2026-04-16 12:08:44'),
(9, 7, '2026-04-16 12:08:44'),
(10, 2, '2026-04-16 12:08:44'),
(10, 4, '2026-04-16 12:08:44'),
(10, 6, '2026-04-16 12:08:44'),
(10, 8, '2026-04-16 12:08:44'),
(11, 2, '2026-04-16 12:08:44'),
(11, 6, '2026-04-16 12:08:44'),
(12, 4, '2026-04-25 10:57:25');

-- --------------------------------------------------------

--
-- Table structure for table `friendships`
--

CREATE TABLE `friendships` (
  `user_a` bigint(20) UNSIGNED NOT NULL,
  `user_b` bigint(20) UNSIGNED NOT NULL,
  `since` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `groups_table`
--

CREATE TABLE `groups_table` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `owner_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `cover` varchar(255) DEFAULT NULL,
  `is_private` tinyint(1) DEFAULT 0,
  `member_count` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `group_members`
--

CREATE TABLE `group_members` (
  `group_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `role` enum('member','moderator','owner') DEFAULT 'member',
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `can_post` tinyint(1) DEFAULT 1,
  `can_invite` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hashtags`
--

CREATE TABLE `hashtags` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tag` varchar(100) NOT NULL,
  `post_count` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `conversation_id` bigint(20) UNSIGNED NOT NULL,
  `sender_id` bigint(20) UNSIGNED NOT NULL,
  `content` text NOT NULL,
  `is_flagged` tinyint(1) DEFAULT 0,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `is_flagged`, `is_read`, `created_at`) VALUES
(1, 1, 2, '👋 Hey!', 0, 0, '2026-04-16 13:01:11'),
(2, 1, 2, 'how are you doing', 0, 0, '2026-04-16 13:01:40');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(50) NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`data`)),
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `data`, `is_read`, `created_at`) VALUES
(1, 2, 'follow', '{\"from_user\":3,\"message\":\"started following you\"}', 1, '2026-04-16 12:08:44'),
(2, 2, 'like', '{\"from_user\":4,\"post_id\":1}', 1, '2026-04-16 12:08:44'),
(3, 2, 'comment', '{\"from_user\":3,\"post_id\":1}', 1, '2026-04-16 12:08:44'),
(4, 3, 'follow', '{\"from_user\":2,\"message\":\"started following you\"}', 0, '2026-04-16 12:08:44'),
(5, 4, 'like', '{\"from_user\":6,\"post_id\":3}', 0, '2026-04-16 12:08:44'),
(6, 5, 'like', '{\"from_user\":2,\"post_id\":4}', 0, '2026-04-16 12:08:44'),
(7, 6, 'like', '{\"from_user\":2,\"post_id\":5}', 0, '2026-04-16 12:19:12'),
(8, 10, 'like', '{\"from_user\":2,\"post_id\":9}', 0, '2026-04-16 12:19:17'),
(9, 4, 'follow', '{\"from_user\":1,\"message\":\"started following you\"}', 0, '2026-04-16 12:52:24'),
(10, 6, 'message', '{\"from_user\":2,\"conversation_id\":1,\"preview\":\"\\ud83d\\udc4b Hey!\"}', 0, '2026-04-16 13:01:11'),
(11, 6, 'message', '{\"from_user\":2,\"conversation_id\":1,\"preview\":\"how are you doing\"}', 0, '2026-04-16 13:01:40'),
(12, 4, 'follow', '{\"from_user\":12,\"message\":\"started following you\"}', 0, '2026-04-25 10:57:25'),
(13, 6, 'like', '{\"from_user\":12,\"post_id\":5}', 0, '2026-04-25 11:00:56');

-- --------------------------------------------------------

--
-- Table structure for table `notification_prefs`
--

CREATE TABLE `notification_prefs` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `messages` tinyint(1) DEFAULT 1,
  `posts` tinyint(1) DEFAULT 1,
  `follows` tinyint(1) DEFAULT 1,
  `sounds` tinyint(1) DEFAULT 1,
  `vibration` tinyint(1) DEFAULT 1,
  `show_previews` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `parent_child`
--

CREATE TABLE `parent_child` (
  `parent_id` bigint(20) UNSIGNED NOT NULL,
  `child_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `parent_child`
--

INSERT INTO `parent_child` (`parent_id`, `child_id`, `created_at`) VALUES
(5, 11, '2026-04-16 12:08:44');

-- --------------------------------------------------------

--
-- Table structure for table `polls`
--

CREATE TABLE `polls` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `post_id` bigint(20) UNSIGNED NOT NULL,
  `question` varchar(300) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NOT NULL DEFAULT (current_timestamp() + interval 7 day)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `poll_options`
--

CREATE TABLE `poll_options` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `poll_id` bigint(20) UNSIGNED NOT NULL,
  `text` varchar(200) NOT NULL,
  `votes` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `poll_votes`
--

CREATE TABLE `poll_votes` (
  `poll_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `option_id` bigint(20) UNSIGNED NOT NULL,
  `voted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `content` text NOT NULL,
  `media` varchar(255) DEFAULT NULL,
  `media_type` enum('none','image','video') DEFAULT 'none',
  `is_flagged` tinyint(1) DEFAULT 0,
  `likes` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `scheduled_at` timestamp NULL DEFAULT NULL,
  `is_published` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `user_id`, `content`, `media`, `media_type`, `is_flagged`, `likes`, `created_at`, `scheduled_at`, `is_published`) VALUES
(1, 2, 'Just captured the most beautiful sunset over the Rift Valley 🌅 Nature never disappoints. Who else loves chasing golden hour?', NULL, 'none', 0, 47, '2026-04-16 12:08:44', NULL, 1),
(2, 3, 'Hot take: the best code is the code you never have to write. Simplicity is the ultimate sophistication. What do you think? 💻', NULL, 'none', 0, 38, '2026-04-16 12:08:44', NULL, 1),
(3, 4, 'Redesigned the entire onboarding flow for a client today. Before: 12 steps. After: 3 steps. Conversion rate went up 40%. Design matters! ✨', NULL, 'none', 0, 91, '2026-04-16 12:08:44', NULL, 1),
(4, 5, 'Starting a new business is 10% inspiration and 90% perspiration. Been grinding for 6 months — first real revenue came in today! 🎉', NULL, 'none', 0, 64, '2026-04-16 12:08:44', NULL, 1),
(5, 6, 'Teaching 35 kids today who had never touched a computer before. By the end of the session they were building their own websites. This is why I do what I do. 🌍', NULL, 'none', 0, 122, '2026-04-16 12:08:44', NULL, 1),
(6, 7, 'New track dropping Friday! Been working on this one for 3 months. Afrobeats meets jazz. You are not ready 🎵🔥', NULL, 'none', 0, 83, '2026-04-16 12:08:44', NULL, 1),
(7, 8, 'Year 3 of medical school: the moment when everything clicks and you realize how incredibly complex and beautiful the human body is. 🩺', NULL, 'none', 0, 55, '2026-04-16 12:08:44', NULL, 1),
(8, 9, 'Cycled 120km today through the Rwenzori foothills. My legs are gone but my soul is full. Uganda is BEAUTIFUL. 🚴🏔️', NULL, 'none', 0, 72, '2026-04-16 12:08:44', NULL, 1),
(9, 10, 'Climate justice IS social justice. We cannot separate environmental collapse from the communities it hits hardest. Time to act. 🌱', NULL, 'none', 0, 100, '2026-04-16 12:08:44', NULL, 1),
(10, 2, 'Photography tip: The best camera is the one you have with you. Stopped waiting for \"perfect conditions\" and started shooting. Game changer. 📸', NULL, 'none', 0, 41, '2026-04-16 12:08:44', NULL, 1),
(11, 3, 'Just open-sourced a tool I built for automating database migrations. Link in bio. Contributions welcome! 💡', NULL, 'none', 0, 29, '2026-04-16 12:08:44', NULL, 1),
(12, 4, 'Color theory thread 🧵\n1. Complementary colors create energy\n2. Analogous colors create harmony\n3. Triadic colors create balance\n\nWhich do you use most?', NULL, 'none', 0, 67, '2026-04-16 12:08:44', NULL, 1),
(13, 5, 'Lesson learned: your network really is your net worth. Three deals this week came through people I met at a community meetup 2 years ago. Invest in relationships.', NULL, 'none', 0, 53, '2026-04-16 12:08:44', NULL, 1),
(14, 6, 'Free coding workshop this Saturday in Dakar! For ages 10-18. All materials provided. DM me to register. Let us build the next generation of African tech talent 🌍', NULL, 'none', 0, 88, '2026-04-16 12:08:44', NULL, 1),
(15, 7, 'Listening back to my first ever recording vs now. Growth is not always visible day to day but looking back... wow. Keep going. 🎶', NULL, 'none', 0, 44, '2026-04-16 12:08:44', NULL, 1),
(16, 2, 'whats up\n', NULL, 'none', 0, 0, '2026-04-19 06:51:41', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `post_hashtags`
--

CREATE TABLE `post_hashtags` (
  `post_id` bigint(20) UNSIGNED NOT NULL,
  `hashtag_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `post_likes`
--

CREATE TABLE `post_likes` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `post_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `post_likes`
--

INSERT INTO `post_likes` (`user_id`, `post_id`, `created_at`) VALUES
(2, 5, '2026-04-16 12:19:12'),
(2, 9, '2026-04-16 12:19:17'),
(12, 5, '2026-04-25 11:00:56');

-- --------------------------------------------------------

--
-- Table structure for table `post_reactions`
--

CREATE TABLE `post_reactions` (
  `post_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `emoji` varchar(10) DEFAULT '❤️',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `privacy_settings`
--

CREATE TABLE `privacy_settings` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `last_seen` enum('everyone','contacts','nobody') DEFAULT 'everyone',
  `profile_photo` enum('everyone','contacts','nobody') DEFAULT 'everyone',
  `phone_number` enum('everyone','contacts','nobody') DEFAULT 'nobody',
  `who_can_call` enum('everyone','contacts','nobody') DEFAULT 'everyone',
  `who_can_add_groups` enum('everyone','contacts','nobody') DEFAULT 'everyone'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `profile_views`
--

CREATE TABLE `profile_views` (
  `viewer_id` bigint(20) UNSIGNED NOT NULL,
  `viewed_id` bigint(20) UNSIGNED NOT NULL,
  `viewed_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reactions`
--

CREATE TABLE `reactions` (
  `post_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('like','love','haha','wow','sad','angry') DEFAULT 'like',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `reporter_id` bigint(20) UNSIGNED NOT NULL,
  `content_type` enum('post','message','video','task','user') NOT NULL,
  `content_id` bigint(20) UNSIGNED NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','reviewed','dismissed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reposts`
--

CREATE TABLE `reposts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `post_id` bigint(20) UNSIGNED NOT NULL,
  `quote` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `saved_messages`
--

CREATE TABLE `saved_messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `content` text NOT NULL,
  `media` varchar(255) DEFAULT NULL,
  `media_type` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `screen_time`
--

CREATE TABLE `screen_time` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `child_id` bigint(20) UNSIGNED NOT NULL,
  `daily_limit` int(11) NOT NULL DEFAULT 120,
  `used_time` int(11) NOT NULL DEFAULT 0,
  `date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `screen_time`
--

INSERT INTO `screen_time` (`id`, `child_id`, `daily_limit`, `used_time`, `date`) VALUES
(1, 11, 90, 45, '2026-04-16');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(64) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `device_name` varchar(200) DEFAULT 'Unknown Device',
  `device_type` varchar(50) DEFAULT 'browser',
  `ip_address` varchar(45) DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `last_active` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stories`
--

CREATE TABLE `stories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `media` varchar(255) NOT NULL,
  `media_type` enum('image','video') DEFAULT 'image',
  `caption` varchar(300) DEFAULT NULL,
  `views` int(11) DEFAULT 0,
  `expires_at` timestamp NOT NULL DEFAULT (current_timestamp() + interval 24 hour),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stories`
--

INSERT INTO `stories` (`id`, `user_id`, `media`, `media_type`, `caption`, `views`, `expires_at`, `created_at`) VALUES
(1, 2, 'http://localhost:8000/storage/images/nx_69e0d34e79eb32.67589519_2.png', 'image', 'wow this is good day', 2, '2026-04-17 12:17:39', '2026-04-16 12:17:39');

-- --------------------------------------------------------

--
-- Table structure for table `story_views`
--

CREATE TABLE `story_views` (
  `story_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `viewed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `story_views`
--

INSERT INTO `story_views` (`story_id`, `user_id`, `viewed_at`) VALUES
(1, 2, '2026-04-16 12:20:52');

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `location` varchar(200) DEFAULT NULL,
  `budget` decimal(10,2) DEFAULT 0.00,
  `status` enum('open','assigned','completed','cancelled') DEFAULT 'open',
  `is_flagged` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `user_id`, `title`, `description`, `location`, `budget`, `status`, `is_flagged`, `created_at`) VALUES
(1, 3, 'Need a freelance React developer', 'Looking for someone to build a dashboard component. Figma designs ready. 2-3 day task.', 'Remote', 150.00, 'open', 0, '2026-04-16 12:08:44'),
(2, 5, 'Business plan review & feedback', 'Need an experienced entrepreneur or consultant to review my 15-page business plan for a food delivery startup.', 'Lilongwe, Malawi', 50.00, 'open', 0, '2026-04-16 12:08:44'),
(3, 2, 'Photo editing - 50 RAW files', 'Need someone to colour-grade and edit 50 portrait photos in Lightroom. Consistent style. Sample provided.', 'Remote', 80.00, 'open', 0, '2026-04-16 12:08:44'),
(4, 9, 'Bicycle repair - derailleur adjustment', 'My rear derailleur needs adjusting after a crash. Looking for a mechanic in Kampala.', 'Kampala, Uganda', 20.00, 'open', 0, '2026-04-16 12:08:44'),
(5, 10, 'Volunteer graphic designers needed', 'Looking for 2 volunteers to create social media graphics for a climate awareness campaign. Portfolio credit given.', 'Remote', 0.00, 'open', 0, '2026-04-16 12:08:44'),
(6, 6, 'Translation: English to Wolof', 'Need 3 short workshop documents (500 words each) translated from English to Wolof.', 'Remote', 60.00, 'open', 0, '2026-04-16 12:08:44'),
(7, 4, 'Logo design for new coffee brand', 'Modern, minimalist logo for an artisan coffee roastery. Provide 3 concepts.', 'Cape Town, SA', 200.00, 'open', 0, '2026-04-16 12:08:44'),
(8, 8, 'Medical textbook study group', 'Looking for 2-3 medical students in Cairo to form a study group for our pharmacology exams.', 'Cairo, Egypt', 0.00, 'open', 0, '2026-04-16 12:08:44');

-- --------------------------------------------------------

--
-- Table structure for table `trust_events`
--

CREATE TABLE `trust_events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `event_type` varchar(60) NOT NULL,
  `delta` int(11) NOT NULL,
  `reason` varchar(200) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `two_fa_codes`
--

CREATE TABLE `two_fa_codes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(10) NOT NULL,
  `purpose` varchar(50) DEFAULT 'login',
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `used` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `trust_score` int(11) DEFAULT 100,
  `is_kids` tinyint(1) DEFAULT 0,
  `two_fa_secret` varchar(100) DEFAULT NULL,
  `two_fa_enabled` tinyint(1) DEFAULT 0,
  `location` varchar(200) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `cover_photo` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` varchar(30) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `onboarding_done` tinyint(1) DEFAULT 0,
  `theme` varchar(10) DEFAULT 'light',
  `profile_views_count` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `email`, `phone`, `password`, `avatar`, `bio`, `role`, `trust_score`, `is_kids`, `two_fa_secret`, `two_fa_enabled`, `location`, `is_active`, `created_at`, `updated_at`, `cover_photo`, `website`, `date_of_birth`, `gender`, `is_verified`, `onboarding_done`, `theme`, `profile_views_count`) VALUES
(1, 'NEXUS Admin', 'admin', 'admin@nexus.com', NULL, '$2y$10$FW1Aiyf72mtq.wGFnJocoeB9S53u1vbrsQPO9rjQ3hYkKXy83p3VG', NULL, NULL, 'admin', 100, 0, NULL, 0, NULL, 1, '2026-04-16 12:06:07', '2026-04-16 12:45:27', NULL, NULL, NULL, NULL, 0, 0, 'light', 0),
(2, 'Alice Mwangi', 'alicemwangi', 'alice@nexus.com', NULL, '$2y$10$FW1Aiyf72mtq.wGFnJocoeB9S53u1vbrsQPO9rjQ3hYkKXy83p3VG', 'http://localhost:8000/storage/images/nx_69e0d39b8a4638.66372762_2.png', 'Digital creator & photographer 📸', 'user', 320, 0, NULL, 0, 'Nairobi, Kenya', 1, '2026-04-16 12:08:43', '2026-04-17 05:36:55', NULL, NULL, NULL, NULL, 0, 0, 'light', 0),
(3, 'Bob Okafor', 'bobokafor', 'bob@nexus.com', NULL, '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIXFlpBp93E2jqK', NULL, 'Software engineer. Coffee addict ☕', 'user', 280, 0, NULL, 0, 'Lagos, Nigeria', 1, '2026-04-16 12:08:43', '2026-04-16 12:08:43', NULL, NULL, NULL, NULL, 0, 0, 'light', 0),
(4, 'Sara Chen', 'sarachen', 'sara@nexus.com', NULL, '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIXFlpBp93E2jqK', NULL, 'UI/UX designer. Making things beautiful ✨', 'user', 415, 0, NULL, 0, 'Cape Town, SA', 1, '2026-04-16 12:08:43', '2026-04-16 12:08:43', NULL, NULL, NULL, NULL, 0, 0, 'light', 0),
(5, 'James Banda', 'jamesbanda', 'james@nexus.com', NULL, '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIXFlpBp93E2jqK', NULL, 'Entrepreneur | Hustler | Dad 👨‍👧', 'user', 190, 0, NULL, 0, 'Lilongwe, Malawi', 1, '2026-04-16 12:08:43', '2026-04-16 12:08:43', NULL, NULL, NULL, NULL, 0, 0, 'light', 0),
(6, 'Aisha Diallo', 'aishadiallo', 'aisha@nexus.com', NULL, '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIXFlpBp93E2jqK', NULL, 'Teacher & community builder 🌍', 'user', 350, 0, NULL, 0, 'Dakar, Senegal', 1, '2026-04-16 12:08:43', '2026-04-16 12:08:43', NULL, NULL, NULL, NULL, 0, 0, 'light', 0),
(7, 'Kwame Asante', 'kwameasante', 'kwame@nexus.com', NULL, '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIXFlpBp93E2jqK', NULL, 'Musician | Afrobeats producer 🎵', 'user', 260, 0, NULL, 0, 'Accra, Ghana', 1, '2026-04-16 12:08:43', '2026-04-16 12:08:43', NULL, NULL, NULL, NULL, 0, 0, 'light', 0),
(8, 'Fatima Hassan', 'fatimahassan', 'fatima@nexus.com', NULL, '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIXFlpBp93E2jqK', NULL, 'Medical student. Future doctor 🩺', 'user', 305, 0, NULL, 0, 'Cairo, Egypt', 1, '2026-04-16 12:08:43', '2026-04-16 12:46:21', NULL, NULL, NULL, NULL, 0, 0, 'light', 0),
(9, 'David Mutua', 'davidmutua', 'david@nexus.com', NULL, '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIXFlpBp93E2jqK', NULL, 'Cyclist & travel blogger 🚴', 'user', 175, 0, NULL, 0, 'Kampala, Uganda', 1, '2026-04-16 12:08:43', '2026-04-16 12:08:43', NULL, NULL, NULL, NULL, 0, 0, 'light', 0),
(10, 'Zoe Mthembu', 'zoemthembu', 'zoe@nexus.com', NULL, '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIXFlpBp93E2jqK', NULL, 'Activist. Climate. Justice. 🌱', 'user', 390, 0, NULL, 0, 'Durban, SA', 1, '2026-04-16 12:08:43', '2026-04-16 12:08:43', NULL, NULL, NULL, NULL, 0, 0, 'light', 0),
(11, 'Noah Junior', 'noahjr', 'noah@nexus.com', NULL, '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIXFlpBp93E2jqK', NULL, NULL, 'user', 100, 1, NULL, 0, 'Accra, Ghana', 1, '2026-04-16 12:08:43', '2026-04-16 12:08:43', NULL, NULL, NULL, NULL, 0, 0, 'light', 0),
(12, 'Rebman chirwa ', 'Rebman', 'rebmanchirwa@gmail.com', '0883490073', '$2y$10$Fl6LPVkR3RbBEx9IRVMEwOIM3dprBx8en3K8MWvmvL.01g3nl7392', 'efgf', 'mam', 'user', 100, 0, NULL, 0, 'lilongwe', 1, '2026-04-25 10:56:46', '2026-04-25 10:56:46', NULL, NULL, '2002-04-01', 'male', 0, 1, 'light', 0);

-- --------------------------------------------------------

--
-- Table structure for table `user_interests`
--

CREATE TABLE `user_interests` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `interest` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_interests`
--

INSERT INTO `user_interests` (`user_id`, `interest`) VALUES
(12, '🍕 Food & Cooking'),
(12, '🏀 Sports');

-- --------------------------------------------------------

--
-- Table structure for table `verification_requests`
--

CREATE TABLE `verification_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `videos`
--

CREATE TABLE `videos` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `media` varchar(255) NOT NULL,
  `thumbnail` varchar(255) DEFAULT NULL,
  `views` int(11) DEFAULT 0,
  `is_flagged` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `videos`
--

INSERT INTO `videos` (`id`, `user_id`, `title`, `description`, `media`, `thumbnail`, `views`, `is_flagged`, `created_at`) VALUES
(1, 7, 'Afrobeats Production Tutorial', 'How I made a beat from scratch in 20 minutes using free plugins. Full breakdown!', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', NULL, 1240, 0, '2026-04-16 12:08:44'),
(2, 2, 'Golden Hour Photography Tips', 'Everything you need to know about shooting at golden hour — settings, composition, locations.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', NULL, 890, 0, '2026-04-16 12:08:44'),
(3, 9, 'Rwenzori Mountains Cycling Vlog', 'Epic 120km ride through Uganda. Stunning scenery and near-death hill descents!', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', NULL, 650, 0, '2026-04-16 12:08:44'),
(4, 4, 'UI Design in 60 Seconds', 'Quick tips to instantly improve your UI. No design degree required.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', NULL, 2100, 0, '2026-04-16 12:08:44'),
(5, 6, 'Teaching Kids to Code', 'A day in my classroom — watch 10-year-olds build their first websites!', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', NULL, 1780, 0, '2026-04-16 12:08:44');

-- --------------------------------------------------------

--
-- Table structure for table `voice_rooms`
--

CREATE TABLE `voice_rooms` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `group_id` bigint(20) UNSIGNED DEFAULT NULL,
  `creator_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `appearance_prefs`
--
ALTER TABLE `appearance_prefs`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `archived_conversations`
--
ALTER TABLE `archived_conversations`
  ADD PRIMARY KEY (`user_id`,`conversation_id`);

--
-- Indexes for table `blocked_users`
--
ALTER TABLE `blocked_users`
  ADD PRIMARY KEY (`blocker_id`,`blocked_id`),
  ADD KEY `blocked_id` (`blocked_id`);

--
-- Indexes for table `bookmarks`
--
ALTER TABLE `bookmarks`
  ADD PRIMARY KEY (`user_id`,`post_id`),
  ADD KEY `post_id` (`post_id`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `conversation_participants`
--
ALTER TABLE `conversation_participants`
  ADD PRIMARY KEY (`conversation_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `creator_id` (`creator_id`);

--
-- Indexes for table `event_attendees`
--
ALTER TABLE `event_attendees`
  ADD PRIMARY KEY (`event_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `follows`
--
ALTER TABLE `follows`
  ADD PRIMARY KEY (`follower_id`,`following_id`),
  ADD KEY `following_id` (`following_id`);

--
-- Indexes for table `friendships`
--
ALTER TABLE `friendships`
  ADD PRIMARY KEY (`user_a`,`user_b`),
  ADD KEY `user_b` (`user_b`);

--
-- Indexes for table `groups_table`
--
ALTER TABLE `groups_table`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Indexes for table `group_members`
--
ALTER TABLE `group_members`
  ADD PRIMARY KEY (`group_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `hashtags`
--
ALTER TABLE `hashtags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tag` (`tag`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `conversation_id` (`conversation_id`),
  ADD KEY `sender_id` (`sender_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `notification_prefs`
--
ALTER TABLE `notification_prefs`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `parent_child`
--
ALTER TABLE `parent_child`
  ADD PRIMARY KEY (`parent_id`,`child_id`),
  ADD KEY `child_id` (`child_id`);

--
-- Indexes for table `polls`
--
ALTER TABLE `polls`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_id` (`post_id`);

--
-- Indexes for table `poll_options`
--
ALTER TABLE `poll_options`
  ADD PRIMARY KEY (`id`),
  ADD KEY `poll_id` (`poll_id`);

--
-- Indexes for table `poll_votes`
--
ALTER TABLE `poll_votes`
  ADD PRIMARY KEY (`poll_id`,`user_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `option_id` (`option_id`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `post_hashtags`
--
ALTER TABLE `post_hashtags`
  ADD PRIMARY KEY (`post_id`,`hashtag_id`),
  ADD KEY `hashtag_id` (`hashtag_id`);

--
-- Indexes for table `post_likes`
--
ALTER TABLE `post_likes`
  ADD PRIMARY KEY (`user_id`,`post_id`),
  ADD KEY `post_id` (`post_id`);

--
-- Indexes for table `post_reactions`
--
ALTER TABLE `post_reactions`
  ADD PRIMARY KEY (`post_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `privacy_settings`
--
ALTER TABLE `privacy_settings`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `profile_views`
--
ALTER TABLE `profile_views`
  ADD PRIMARY KEY (`viewer_id`,`viewed_id`),
  ADD KEY `viewed_id` (`viewed_id`);

--
-- Indexes for table `reactions`
--
ALTER TABLE `reactions`
  ADD PRIMARY KEY (`post_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reporter_id` (`reporter_id`);

--
-- Indexes for table `reposts`
--
ALTER TABLE `reposts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `post_id` (`post_id`);

--
-- Indexes for table `saved_messages`
--
ALTER TABLE `saved_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `screen_time`
--
ALTER TABLE `screen_time`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_child_date` (`child_id`,`date`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `stories`
--
ALTER TABLE `stories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `story_views`
--
ALTER TABLE `story_views`
  ADD PRIMARY KEY (`story_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `trust_events`
--
ALTER TABLE `trust_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `two_fa_codes`
--
ALTER TABLE `two_fa_codes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_interests`
--
ALTER TABLE `user_interests`
  ADD PRIMARY KEY (`user_id`,`interest`);

--
-- Indexes for table `verification_requests`
--
ALTER TABLE `verification_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `videos`
--
ALTER TABLE `videos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `voice_rooms`
--
ALTER TABLE `voice_rooms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `creator_id` (`creator_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `conversations`
--
ALTER TABLE `conversations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `groups_table`
--
ALTER TABLE `groups_table`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hashtags`
--
ALTER TABLE `hashtags`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `polls`
--
ALTER TABLE `polls`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `poll_options`
--
ALTER TABLE `poll_options`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reposts`
--
ALTER TABLE `reposts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `saved_messages`
--
ALTER TABLE `saved_messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `screen_time`
--
ALTER TABLE `screen_time`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `stories`
--
ALTER TABLE `stories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `trust_events`
--
ALTER TABLE `trust_events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `two_fa_codes`
--
ALTER TABLE `two_fa_codes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `verification_requests`
--
ALTER TABLE `verification_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `videos`
--
ALTER TABLE `videos`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `voice_rooms`
--
ALTER TABLE `voice_rooms`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `appearance_prefs`
--
ALTER TABLE `appearance_prefs`
  ADD CONSTRAINT `appearance_prefs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `archived_conversations`
--
ALTER TABLE `archived_conversations`
  ADD CONSTRAINT `archived_conversations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `blocked_users`
--
ALTER TABLE `blocked_users`
  ADD CONSTRAINT `blocked_users_ibfk_1` FOREIGN KEY (`blocker_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `blocked_users_ibfk_2` FOREIGN KEY (`blocked_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `bookmarks`
--
ALTER TABLE `bookmarks`
  ADD CONSTRAINT `bookmarks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookmarks_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `conversation_participants`
--
ALTER TABLE `conversation_participants`
  ADD CONSTRAINT `conversation_participants_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `conversation_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `event_attendees`
--
ALTER TABLE `event_attendees`
  ADD CONSTRAINT `event_attendees_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_attendees_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `follows`
--
ALTER TABLE `follows`
  ADD CONSTRAINT `follows_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `follows_ibfk_2` FOREIGN KEY (`following_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `friendships`
--
ALTER TABLE `friendships`
  ADD CONSTRAINT `friendships_ibfk_1` FOREIGN KEY (`user_a`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `friendships_ibfk_2` FOREIGN KEY (`user_b`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `groups_table`
--
ALTER TABLE `groups_table`
  ADD CONSTRAINT `groups_table_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `group_members`
--
ALTER TABLE `group_members`
  ADD CONSTRAINT `group_members_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `groups_table` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `group_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notification_prefs`
--
ALTER TABLE `notification_prefs`
  ADD CONSTRAINT `notification_prefs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `parent_child`
--
ALTER TABLE `parent_child`
  ADD CONSTRAINT `parent_child_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `parent_child_ibfk_2` FOREIGN KEY (`child_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `polls`
--
ALTER TABLE `polls`
  ADD CONSTRAINT `polls_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `poll_options`
--
ALTER TABLE `poll_options`
  ADD CONSTRAINT `poll_options_ibfk_1` FOREIGN KEY (`poll_id`) REFERENCES `polls` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `poll_votes`
--
ALTER TABLE `poll_votes`
  ADD CONSTRAINT `poll_votes_ibfk_1` FOREIGN KEY (`poll_id`) REFERENCES `polls` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `poll_votes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `poll_votes_ibfk_3` FOREIGN KEY (`option_id`) REFERENCES `poll_options` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `post_hashtags`
--
ALTER TABLE `post_hashtags`
  ADD CONSTRAINT `post_hashtags_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_hashtags_ibfk_2` FOREIGN KEY (`hashtag_id`) REFERENCES `hashtags` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `post_likes`
--
ALTER TABLE `post_likes`
  ADD CONSTRAINT `post_likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_likes_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `post_reactions`
--
ALTER TABLE `post_reactions`
  ADD CONSTRAINT `post_reactions_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_reactions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `privacy_settings`
--
ALTER TABLE `privacy_settings`
  ADD CONSTRAINT `privacy_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `profile_views`
--
ALTER TABLE `profile_views`
  ADD CONSTRAINT `profile_views_ibfk_1` FOREIGN KEY (`viewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `profile_views_ibfk_2` FOREIGN KEY (`viewed_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reactions`
--
ALTER TABLE `reactions`
  ADD CONSTRAINT `reactions_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reactions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reposts`
--
ALTER TABLE `reposts`
  ADD CONSTRAINT `reposts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reposts_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `saved_messages`
--
ALTER TABLE `saved_messages`
  ADD CONSTRAINT `saved_messages_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `screen_time`
--
ALTER TABLE `screen_time`
  ADD CONSTRAINT `screen_time_ibfk_1` FOREIGN KEY (`child_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stories`
--
ALTER TABLE `stories`
  ADD CONSTRAINT `stories_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `story_views`
--
ALTER TABLE `story_views`
  ADD CONSTRAINT `story_views_ibfk_1` FOREIGN KEY (`story_id`) REFERENCES `stories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `story_views_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trust_events`
--
ALTER TABLE `trust_events`
  ADD CONSTRAINT `trust_events_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `two_fa_codes`
--
ALTER TABLE `two_fa_codes`
  ADD CONSTRAINT `two_fa_codes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_interests`
--
ALTER TABLE `user_interests`
  ADD CONSTRAINT `user_interests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `verification_requests`
--
ALTER TABLE `verification_requests`
  ADD CONSTRAINT `verification_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `videos`
--
ALTER TABLE `videos`
  ADD CONSTRAINT `videos_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `voice_rooms`
--
ALTER TABLE `voice_rooms`
  ADD CONSTRAINT `voice_rooms_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
