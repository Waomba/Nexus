<?php
class MessageController {
    private MessageModel $messages;
    public function __construct() { $this->messages = new MessageModel(); }

    public function conversations(): void {
        $auth = requireAuth();
        success($this->messages->userConversations($auth['user_id']));
    }

    public function send(): void {
        $auth = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($data['receiver_id']) || empty($data['content'])) error('receiver_id and content required');

        $convId = $this->messages->getOrCreateConversation($auth['user_id'], (int)$data['receiver_id']);
        $msgId  = $this->messages->send($convId, $auth['user_id'], $data['content']);

        (new NotificationModel())->create((int)$data['receiver_id'], 'message', [
            'from_user'       => $auth['user_id'],
            'conversation_id' => $convId,
            'preview'         => substr($data['content'], 0, 50),
        ]);
        (new ActivityLogModel())->log($auth['user_id'], 'sent_message');
        success(['id' => $msgId, 'conversation_id' => $convId], 'Message sent');
    }

    public function conversation(int $convId): void {
        $auth = requireAuth();
        $msgs = $this->messages->conversation($convId, $auth['user_id']);
        $this->messages->markRead($convId, $auth['user_id']);
        success($msgs);
    }
}
