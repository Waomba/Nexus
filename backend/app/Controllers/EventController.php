<?php
class EventController {
    private PDO $db;
    public function __construct() { $this->db = getDB(); }

    public function index(): void {
        $stmt = $this->db->prepare("
            SELECT e.*,u.name,u.username,u.avatar,
                   (SELECT COUNT(*) FROM event_attendees ea WHERE ea.event_id=e.id AND ea.status='going') as going_count
            FROM events e JOIN users u ON u.id=e.creator_id
            WHERE e.start_time >= NOW()
            ORDER BY e.start_time ASC LIMIT 20
        ");
        $stmt->execute();
        success($stmt->fetchAll());
    }

    public function create(): void {
        $auth = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($data['title']) || empty($data['start_time'])) error('title and start_time required');
        $stmt = $this->db->prepare("INSERT INTO events (creator_id,title,description,location,cover,start_time,end_time,is_online,max_attendees) VALUES (?,?,?,?,?,?,?,?,?)");
        $stmt->execute([$auth['user_id'],$data['title'],$data['description'] ?? null,$data['location'] ?? null,$data['cover'] ?? null,$data['start_time'],$data['end_time'] ?? null,$data['is_online'] ?? 0,$data['max_attendees'] ?? null]);
        $id = (int)$this->db->lastInsertId();
        // Auto-attend as going
        $this->db->prepare("INSERT IGNORE INTO event_attendees (event_id,user_id,status) VALUES (?,?,'going')")->execute([$id,$auth['user_id']]);
        success(['id'=>$id], 'Event created');
    }

    public function rsvp(int $id): void {
        $auth = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $status = $data['status'] ?? 'going';
        if (!in_array($status, ['going','interested','not_going'])) error('Invalid status');
        $this->db->prepare("INSERT INTO event_attendees (event_id,user_id,status) VALUES (?,?,?) ON DUPLICATE KEY UPDATE status=?")->execute([$id,$auth['user_id'],$status,$status]);
        success([], 'RSVP updated');
    }

    public function show(int $id): void {
        $stmt = $this->db->prepare("SELECT e.*,u.name,u.username,u.avatar FROM events e JOIN users u ON u.id=e.creator_id WHERE e.id=?");
        $stmt->execute([$id]);
        $event = $stmt->fetch();
        if (!$event) error('Event not found', 404);
        $attendees = $this->db->prepare("SELECT u.id,u.name,u.username,u.avatar,ea.status FROM event_attendees ea JOIN users u ON u.id=ea.user_id WHERE ea.event_id=?");
        $attendees->execute([$id]);
        $event['attendees'] = $attendees->fetchAll();
        success($event);
    }
}
