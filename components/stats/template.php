<?php
/**
 * Stats Component Template
 */
?>
<div class="stats-component">
    <h2 class="stats-title"><?php echo $title ?? 'Statistics'; ?></h2>
    <div class="stats-grid">
        <?php if (isset($stats) && !empty($stats)): ?>
            <?php foreach ($stats as $stat): ?>
                <div class="stat-item">
                    <div class="stat-value"><?php echo $stat['value']; ?></div>
                    <div class="stat-label"><?php echo $stat['label']; ?></div>
                    <?php if (isset($stat['description'])): ?>
                        <div class="stat-description"><?php echo $stat['description']; ?></div>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        <?php else: ?>
            <div class="stats-placeholder">
                <p>Add your key statistics here (subscribers, views, events, etc.)</p>
                <button class="add-stat-btn">+ Add Statistic</button>
            </div>
        <?php endif; ?>
    </div>
    <?php if (isset($stats) && !empty($stats)): ?>
        <button class="add-stat-btn">+ Add Statistic</button>
    <?php endif; ?>
</div>