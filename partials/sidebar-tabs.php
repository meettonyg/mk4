<div class="sidebar-tabs">
    <button class="sidebar-tab active" data-tab="components">Components</button>
    <button class="sidebar-tab" data-tab="design">Design</button>
    <button class="sidebar-tab" data-tab="layout">Layout</button>
</div>
<div class="sidebar-content">
    <?php
    include __DIR__ . '/tab-components.php';
    include __DIR__ . '/tab-design.php';
    include __DIR__ . '/tab-layout.php';
    ?>
</div>
