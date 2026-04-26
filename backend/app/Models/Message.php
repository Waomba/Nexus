<?php
class MessageModel {
    private PDO $db;
    public function __construct() { $this->db = getDB(); }

    public function getOrCreateConversation(int $userA, int $userB): int {
        $stmt = $this->db->prepare("
            SELECT cp1.conversation_id FROM conversation_participants cp1
            JOIN conversation_participants cp2 ON cp1.conversation_id=cp2.conversation_id
            WHERE cp1.user_id=? AND cp2.user_id=?
        ");
        $stmt->execute([$userA,$userB]);
        $row = $stmt->fetch();
        if ($row) return (int)$row['conversation_id'];
        $this->db->exec("INSERT INTO conversations () VALUES ()");
        $cid = (int)$this->db->lastInsertId();
        $this->db->prepare("INSERT INTO conversation_participants (conversation_id,user_id) VALUES (?,?),(?,?)")->execute([$cid,$userA,$cid,$userB]);
        return $cid;
    }

    public function send(int $convId, int $senderId, string $content): int {
        $stmt = $this->db->prepare("INSERT INTO messages (conversation_id,sender_id,content) VALUES (?,?,?)");
        $stmt->execute([$convId,$senderId,$content]);
        return (int)$this->db->lastInsertId();
    }

    public function conversation(int $convId, int $userId): array {
        // verify user is in conversation
        $stmt = $this->db->prepare("SELECT 1 FROM conversation_participants WHERE conversation_id=? AND user_id=?");
        $stmt->execute([$convId,$userId]);
        if (!$stmt->fetch()) return [];
        $stmt = $this->db->prepare("SELECT m.*,u.name,u.username,u.avatar FROM messages m JOIN users u ON u.id=m.sender_id WHERE m.conversation_id=? ORDER BY m.created_at ASC");
        $stmt->execute([$convId]);
        return $stmt->fetchAll();
    }

    public function userConversations(int $userId): array {
        $stmt = $this->db->prepare("
            SELECT c.id as conversation_id,
                   u.id as other_user_id, u.name, u.username, u.avatar,
                   (SELECT content FROM messages m WHERE m.conversation_id=c.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
                   (SELECT created_at FROM messages m WHERE m.conversation_id=c.id ORDER BY m.created_at DESC LIMIT 1) as last_time,
                   (SELECT COUNT(*) FROM messages m WHERE m.conversation_id=c.id AND m.is_read=0 AND m.sender_id!=?) as unread
            FROM conversations c
            JOIN conversation_participants cp1 ON cp1.conversation_id=c.id AND cp1.user_id=?
            JOIN conversation_participants cp2 ON cp2.conversation_id=c.id AND cp2.user_id!=?
            JOIN users u ON u.id=cp2.user_id
            ORDER BY last_time DESC
        ");
        $stmt->execute([$userId,$userId,$userId]);
        return $stmt->fetchAll();
    }

    public function markRead(int $convId, int $userId): void {
        $this->db->prepare("UPDATE messages SET is_read=1 WHERE conversation_id=? AND sender_id!=?")->execute([$convId,$userId]);
    }
}
