<div class="sidebar__tabs">
    <button class="sidebar__tab sidebar__tab--active" data-tab="components">Components</button>
    <button class="sidebar__tab" data-tab="design">Design</button>
    <button class="sidebar__tab" data-tab="layout">Layout</button>
</div>
<div class="sidebar__content">
    <?php
    include __DIR__ . '/tab-components.php';
    include __DIR__ . '/tab-design.php';
    include __DIR__ . '/tab-layout.php';
    ?>
</div>