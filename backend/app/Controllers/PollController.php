<?php
class PollController {
    private PDO $db;
    public function __construct() { $this->db = getDB(); }

    public function create(): void {
        $auth = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($data['post_id']) || empty($data['question']) || empty($data['options'])) {
            error('post_id, question, and options required');
        }
        if (count($data['options']) < 2 || count($data['options']) > 4) {
            error('Poll must have 2-4 options');
        }

        // Verify post ownership
        $stmt = $this->db->prepare("SELECT user_id FROM posts WHERE id=?");
        $stmt->execute([$data['post_id']]);
        $post = $stmt->fetch();
        if (!$post || $post['user_id'] !== $auth['user_id']) error('Forbidden', 403);

        $this->db->prepare("INSERT INTO polls (post_id, question) VALUES (?,?)")->execute([$data['post_id'], $data['question']]);
        $pollId = (int)$this->db->lastInsertId();

        foreach ($data['options'] as $opt) {
            if (trim($opt)) {
                $this->db->prepare("INSERT INTO poll_options (poll_id, text) VALUES (?,?)")->execute([$pollId, trim($opt)]);
            }
        }
        success(['poll_id' => $pollId], 'Poll created');
    }

    public function vote(int $pollId): void {
        $auth = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($data['option_id'])) error('option_id required');

        // Check already voted
        $stmt = $this->db->prepare("SELECT 1 FROM poll_votes WHERE poll_id=? AND user_id=?");
        $stmt->execute([$pollId, $auth['user_id']]);
        if ($stmt->fetch()) error('You have already voted on this poll');

        // Validate option belongs to poll
        $stmt = $this->db->prepare("SELECT id FROM poll_options WHERE id=? AND poll_id=?");
        $stmt->execute([$data['option_id'], $pollId]);
        if (!$stmt->fetch()) error('Invalid option');

        $this->db->prepare("INSERT INTO poll_votes (poll_id, user_id, option_id) VALUES (?,?,?)")
            ->execute([$pollId, $auth['user_id'], $data['option_id']]);
        $this->db->prepare("UPDATE poll_options SET votes=votes+1 WHERE id=?")->execute([$data['option_id']]);

        success($this->getPollData($pollId, $auth['user_id']), 'Vote recorded');
    }

    public function results(int $pollId): void {
        $auth = requireAuth();
        success($this->getPollData($pollId, $auth['user_id']));
    }

    private function getPollData(int $pollId, int $userId): array {
        $stmt = $this->db->prepare("SELECT * FROM polls WHERE id=?");
        $stmt->execute([$pollId]);
        $poll = $stmt->fetch();
        if (!$poll) return [];

        $stmt = $this->db->prepare("SELECT * FROM poll_options WHERE poll_id=?");
        $stmt->execute([$pollId]);
        $options = $stmt->fetchAll();

        $stmt = $this->db->prepare("SELECT option_id FROM poll_votes WHERE poll_id=? AND user_id=?");
        $stmt->execute([$pollId, $userId]);
        $myVote = $stmt->fetchColumn();

        $total = array_sum(array_column($options, 'votes'));

        foreach ($options as &$opt) {
            $opt['pct'] = $total > 0 ? round(($opt['votes'] / $total) * 100) : 0;
        }

        return [
            'poll'     => $poll,
            'options'  => $options,
            'total'    => $total,
            'my_vote'  => $myVote ?: null,
            'voted'    => (bool)$myVote,
        ];
    }
}
