<?php
class ParentalController {
    public function linkChild(): void {
        $auth = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($data['child_id'])) error('child_id required');

        $childId = (int)$data['child_id'];
        $users   = new UserModel();
        $child   = $users->findById($childId);
        if (!$child) error('Child account not found', 404);

        (new ParentChildModel())->link($auth['user_id'], $childId);
        (new ActivityLogModel())->log($auth['user_id'], 'linked_child', "Child #$childId");
        success([], 'Child account linked');
    }

    public function children(): void {
        $auth = requireAuth();
        $children = (new ParentChildModel())->children($auth['user_id']);
        foreach ($children as &$child) {
            $child['screen_time'] = (new ScreenTimeModel())->getToday($child['id']);
        }
        success($children);
    }

    public function setScreenTime(): void {
        $auth = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        if (empty($data['child_id']) || empty($data['minutes'])) error('child_id and minutes required');

        $childId = (int)$data['child_id'];
        // verify parent owns this child
        $children = (new ParentChildModel())->children($auth['user_id']);
        $ids = array_column($children, 'id');
        if (!in_array($childId, $ids)) error('Not your child account', 403);

        (new ScreenTimeModel())->setLimit($childId, (int)$data['minutes']);
        success([], 'Screen time limit set');
    }

    public function childActivity(int $childId): void {
        $auth = requireAuth();
        $children = (new ParentChildModel())->children($auth['user_id']);
        $ids = array_column($children, 'id');
        if (!in_array($childId, $ids)) error('Forbidden', 403);

        $logs      = (new ActivityLogModel())->forUser($childId, 50);
        $screenTime= (new ScreenTimeModel())->history($childId, 7);
        success(compact('logs','screenTime'));
    }

    public function screenTimeStatus(): void {
        $auth = requireAuth();
        $st = (new ScreenTimeModel())->getToday($auth['user_id']);
        success([
            'daily_limit'    => $st['daily_limit'],
            'used_time'      => $st['used_time'],
            'remaining'      => max(0, $st['daily_limit'] - $st['used_time']),
            'limit_reached'  => $st['used_time'] >= $st['daily_limit'],
        ]);
    }

    public function trackUsage(): void {
        $auth = requireAuth();
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $minutes = max(1, (int)($data['minutes'] ?? 1));
        (new ScreenTimeModel())->addUsage($auth['user_id'], $minutes);
        success([], 'Usage tracked');
    }
}
