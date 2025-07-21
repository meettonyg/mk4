/**
 * FUNCTIONAL TESTS: Bulk Operations Testing
 * Following Gemini's recommendation for granular test file structure
 * 
 * Tests the comprehensive bulk operations functionality including sync all,
 * clear all, reset to MKCG, and undo mechanisms with confirmation dialogs.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupQuickTestData, cleanupTestData } from '../utils/test-data-strategy.js';

describe('Bulk Operations Functionality', () => {
    let testData;
    let integrationInstance;
    let mockElement;
    let mockPanel;
    
    beforeEach(() => {
        // Setup test environment
        testData = setupQuickTestData('complete_mkcg_data');
        
        // Create mock DOM elements
        mockElement = document.createElement('div');
        mockElement.className = 'topics-component';
        document.body.appendChild(mockElement);
        
        mockPanel = document.createElement('div');
        mockPanel.className = 'element-editor';
        document.body.appendChild(mockPanel);
        
        // Initialize integration instance
        integrationInstance = new TopicsMKCGIntegration(mockElement, mockPanel);
        
        // Create MKCG section for testing
        const mkcgSection = integrationInstance.createMKCGSection();
        mockPanel.appendChild(mkcgSection);
        
        // Mock required global functions
        window.scheduleAutoSave = vi.fn();
        window.clearAllTopicsContent = vi.fn();
        window.showBulkOperationFeedback = vi.fn();
        window.getCurrentTopicsData = vi.fn(() => [
            { index: 0, title: 'Topic 1', description: '', icon: 'check' },
            { index: 1, title: 'Topic 2', description: '', icon: 'check' }
        ]);
    });
    
    afterEach(() => {
        // Cleanup
        mockElement.remove();
        mockPanel.remove();
        cleanupTestData();
        
        // Restore global functions
        delete window.scheduleAutoSave;
        delete window.clearAllTopicsContent;
        delete window.showBulkOperationFeedback;
        delete window.getCurrentTopicsData;
    });
    
    describe('Sync All Topics Operation', () => {
        it('should show confirmation dialog for sync all operation', () => {
            const showConfirmationSpy = vi.spyOn(integrationInstance, 'showBulkOperationConfirmation');
            
            integrationInstance.handleSyncAllTopicsWithConfirmation();
            
            expect(showConfirmationSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    operation: 'sync',
                    title: 'Sync All Topics from MKCG',
                    confirmText: 'Sync All Topics',
                    confirmClass: 'btn-primary'
                })
            );
        });
        
        it('should execute sync all topics operation', async () => {
            const storeStateSpy = vi.spyOn(integrationInstance, 'storeBulkOperationState');
            const showProgressSpy = vi.spyOn(integrationInstance, 'showBulkOperationProgress');
            const injectDataSpy = vi.spyOn(integrationInstance, 'injectMKCGDataIntoPanel');
            
            integrationInstance.executeSyncAllTopics();
            
            expect(storeStateSpy).toHaveBeenCalledWith('sync_all', 'Before syncing all topics from MKCG');
            expect(showProgressSpy).toHaveBeenCalledWith('sync', 'Syncing topics from MKCG data...');
            
            // Wait for async operation to complete
            await new Promise(resolve => setTimeout(resolve, 400));
            
            expect(injectDataSpy).toHaveBeenCalled();
        });
        
        it('should handle sync operation with no MKCG data available', () => {
            // Mock empty MKCG data
            vi.spyOn(integrationInstance, 'extractTopicsFromMKCG').mockReturnValue([]);
            const showNotificationSpy = vi.spyOn(integrationInstance, 'showNotification');
            
            integrationInstance.handleSyncAllTopicsWithConfirmation();
            
            expect(showNotificationSpy).toHaveBeenCalledWith('No MKCG topics available to sync', 'warning');
        });
        
        it('should update undo button state after sync operation', async () => {
            const updateUndoSpy = vi.spyOn(integrationInstance, 'updateBulkUndoButtonState');
            
            integrationInstance.executeSyncAllTopics();
            
            // Wait for operation completion
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            expect(updateUndoSpy).toHaveBeenCalled();
        });
    });
    
    describe('Clear All Topics Operation', () => {
        it('should show warning confirmation for clear all operation', () => {
            const showConfirmationSpy = vi.spyOn(integrationInstance, 'showBulkOperationConfirmation');
            
            integrationInstance.handleClearAllTopicsWithConfirmation();
            
            expect(showConfirmationSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    operation: 'clear',
                    title: 'Clear All Topics',
                    confirmText: 'Clear All Topics',
                    confirmClass: 'btn-warning',
                    icon: '⚠️'
                })
            );
        });
        
        it('should execute clear all topics operation', async () => {
            const storeStateSpy = vi.spyOn(integrationInstance, 'storeBulkOperationState');
            const showProgressSpy = vi.spyOn(integrationInstance, 'showBulkOperationProgress');
            
            integrationInstance.executeClearAllTopics();
            
            expect(storeStateSpy).toHaveBeenCalledWith('clear_all', 'Before clearing all topics');
            expect(showProgressSpy).toHaveBeenCalledWith('clear', 'Clearing all topic content...');
            
            // Wait for async operation
            await new Promise(resolve => setTimeout(resolve, 400));
            
            expect(window.clearAllTopicsContent).toHaveBeenCalled();
        });
        
        it('should handle clear operation with no topics to clear', () => {
            // Mock empty topics
            window.getCurrentTopicsData = vi.fn(() => []);
            const showNotificationSpy = vi.spyOn(integrationInstance, 'showNotification');
            
            integrationInstance.handleClearAllTopicsWithConfirmation();
            
            expect(showNotificationSpy).toHaveBeenCalledWith('No topics to clear', 'info');
        });
        
        it('should use fallback clear method if global function unavailable', async () => {
            // Remove global function
            delete window.clearAllTopicsContent;
            
            const clearManualSpy = vi.spyOn(integrationInstance, 'clearAllTopicsManually');
            
            integrationInstance.executeClearAllTopics();
            
            // Wait for operation
            await new Promise(resolve => setTimeout(resolve, 400));
            
            expect(clearManualSpy).toHaveBeenCalled();
        });
    });
    
    describe('Reset to MKCG Operation', () => {
        it('should show before/after comparison for reset operation', () => {
            const createComparisonSpy = vi.spyOn(integrationInstance, 'createBeforeAfterComparison');
            const showConfirmationSpy = vi.spyOn(integrationInstance, 'showBulkOperationConfirmation');
            
            integrationInstance.handleResetToMKCGWithConfirmation();
            
            expect(createComparisonSpy).toHaveBeenCalled();
            expect(showConfirmationSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    operation: 'reset',
                    title: 'Reset to Original MKCG Data',
                    confirmText: 'Reset to MKCG',
                    confirmClass: 'btn-secondary'
                })
            );
        });
        
        it('should execute reset to MKCG operation', async () => {
            const storeStateSpy = vi.spyOn(integrationInstance, 'storeBulkOperationState');
            const injectDataSpy = vi.spyOn(integrationInstance, 'injectMKCGDataIntoPanel');
            
            integrationInstance.executeResetToMKCG();
            
            expect(storeStateSpy).toHaveBeenCalledWith('reset_to_mkcg', 'Before resetting to original MKCG data');
            
            // Wait for operation
            await new Promise(resolve => setTimeout(resolve, 400));
            
            expect(injectDataSpy).toHaveBeenCalled();
        });
        
        it('should handle reset with no original MKCG data available', () => {
            // Mock empty MKCG data
            vi.spyOn(integrationInstance, 'extractTopicsFromMKCG').mockReturnValue([]);
            const showNotificationSpy = vi.spyOn(integrationInstance, 'showNotification');
            
            integrationInstance.handleResetToMKCGWithConfirmation();
            
            expect(showNotificationSpy).toHaveBeenCalledWith('No original MKCG data available to restore', 'warning');
        });
    });
    
    describe('Bulk Undo System', () => {
        beforeEach(() => {
            // Initialize bulk operation history
            integrationInstance.bulkOperationHistory = [
                {
                    operation: 'sync_all',
                    description: 'Test sync operation',
                    timestamp: Date.now(),
                    snapshot: {
                        topics: [
                            { index: 0, title: 'Original Topic 1', description: '', icon: 'check' }
                        ]
                    }
                }
            ];
        });
        
        it('should execute bulk undo operation', async () => {
            const restoreSnapshotSpy = vi.spyOn(integrationInstance, 'restoreTopicsFromSnapshot');
            const updateUndoSpy = vi.spyOn(integrationInstance, 'updateBulkUndoButtonState');
            
            integrationInstance.handleBulkUndo();
            
            // Wait for operation
            await new Promise(resolve => setTimeout(resolve, 400));
            
            expect(restoreSnapshotSpy).toHaveBeenCalled();
            expect(updateUndoSpy).toHaveBeenCalled();
            expect(integrationInstance.bulkOperationHistory.length).toBe(0);
        });
        
        it('should handle undo with no operations to undo', () => {
            integrationInstance.bulkOperationHistory = [];
            const showNotificationSpy = vi.spyOn(integrationInstance, 'showNotification');
            
            integrationInstance.handleBulkUndo();
            
            expect(showNotificationSpy).toHaveBeenCalledWith('No bulk operations to undo', 'info');
        });
        
        it('should store bulk operation state correctly', () => {
            const testOperation = 'test_operation';
            const testDescription = 'Test operation description';
            
            integrationInstance.storeBulkOperationState(testOperation, testDescription);
            
            const lastOperation = integrationInstance.bulkOperationHistory[integrationInstance.bulkOperationHistory.length - 1];
            expect(lastOperation.operation).toBe(testOperation);
            expect(lastOperation.description).toBe(testDescription);
            expect(lastOperation.snapshot).toBeDefined();
            expect(lastOperation.timestamp).toBeDefined();
        });
        
        it('should maintain maximum history size', () => {
            // Add operations beyond max size
            for (let i = 0; i < 5; i++) {
                integrationInstance.storeBulkOperationState(`operation_${i}`, `Description ${i}`);
            }
            
            expect(integrationInstance.bulkOperationHistory.length).toBeLessThanOrEqual(integrationInstance.maxBulkHistorySize);
        });
        
        it('should update undo button state correctly', () => {
            // Create mock undo button
            const undoButton = document.createElement('button');
            undoButton.className = 'mkcg-bulk-undo-btn';
            undoButton.innerHTML = '<span class="btn-description">Undo</span>';
            mockPanel.appendChild(undoButton);
            
            integrationInstance.updateBulkUndoButtonState();
            
            expect(undoButton.disabled).toBe(false);
            expect(undoButton.style.opacity).toBe('1');
        });
    });
    
    describe('Progress Indicators', () => {
        beforeEach(() => {
            // Create progress indicator element
            const progressIndicator = document.createElement('div');
            progressIndicator.className = 'mkcg-progress-indicator';
            progressIndicator.innerHTML = `
                <div class="progress-bar-container">
                    <div class="progress-bar"></div>
                </div>
                <div class="progress-status">
                    <span class="progress-icon"></span>
                    <span class="progress-text"></span>
                    <span class="progress-percentage"></span>
                </div>
            `;
            mockPanel.appendChild(progressIndicator);
        });
        
        it('should show bulk operation progress correctly', () => {
            integrationInstance.showBulkOperationProgress('sync', 'Testing progress...');
            
            const progressIndicator = mockPanel.querySelector('.mkcg-progress-indicator');
            const progressIcon = progressIndicator.querySelector('.progress-icon');
            const progressText = progressIndicator.querySelector('.progress-text');
            
            expect(progressIndicator.style.display).toBe('block');
            expect(progressIcon.textContent).toBe('🔄');
            expect(progressText.textContent).toBe('Testing progress...');
        });
        
        it('should update progress percentage correctly', () => {
            integrationInstance.showBulkOperationProgress('sync', 'Testing...');
            integrationInstance.updateBulkOperationProgress(75, 'Almost done...');
            
            const progressBar = mockPanel.querySelector('.progress-bar');
            const progressPercentage = mockPanel.querySelector('.progress-percentage');
            
            expect(progressBar.style.width).toBe('75%');
            expect(progressPercentage.textContent).toBe('75%');
        });
        
        it('should hide progress indicator correctly', () => {
            integrationInstance.showBulkOperationProgress('sync', 'Testing...');
            integrationInstance.hideBulkOperationProgress();
            
            const progressIndicator = mockPanel.querySelector('.mkcg-progress-indicator');
            expect(progressIndicator.style.display).toBe('none');
        });
        
        it('should use operation-specific icons', () => {
            const operations = ['sync', 'clear', 'reset', 'undo'];
            const expectedIcons = ['🔄', '🗑️', '🔄', '⏪'];
            
            operations.forEach((operation, index) => {
                integrationInstance.showBulkOperationProgress(operation, 'Testing...');
                const progressIcon = mockPanel.querySelector('.progress-icon');
                expect(progressIcon.textContent).toBe(expectedIcons[index]);
            });
        });
    });
    
    describe('Confirmation Dialogs', () => {
        it('should create bulk operation confirmation modal', () => {
            const options = {
                operation: 'test',
                title: 'Test Operation',
                message: 'This is a test',
                icon: '⚠️',
                confirmText: 'Confirm',
                confirmClass: 'btn-primary',
                onConfirm: vi.fn()
            };
            
            integrationInstance.showBulkOperationConfirmation(options);
            
            const modal = document.querySelector('.bulk-operation-modal-overlay');
            expect(modal).toBeDefined();
            
            const modalTitle = modal.querySelector('.modal-title');
            const modalMessage = modal.querySelector('.modal-message');
            const confirmButton = modal.querySelector('.modal-confirm-btn');
            
            expect(modalTitle.textContent).toBe('Test Operation');
            expect(modalMessage.textContent).toBe('This is a test');
            expect(confirmButton.textContent).toBe('Confirm');
            expect(confirmButton.className).toContain('btn-primary');
        });
        
        it('should handle modal confirmation correctly', () => {
            const onConfirmSpy = vi.fn();
            const options = {
                operation: 'test',
                title: 'Test',
                message: 'Test',
                icon: '⚠️',
                confirmText: 'Confirm',
                confirmClass: 'btn-primary',
                onConfirm: onConfirmSpy
            };
            
            integrationInstance.showBulkOperationConfirmation(options);
            
            const confirmButton = document.querySelector('.modal-confirm-btn');
            confirmButton.click();
            
            expect(onConfirmSpy).toHaveBeenCalled();
        });
        
        it('should handle modal cancellation correctly', () => {
            const options = {
                operation: 'test',
                title: 'Test',
                message: 'Test',
                icon: '⚠️',
                confirmText: 'Confirm',
                confirmClass: 'btn-primary',
                onConfirm: vi.fn()
            };
            
            integrationInstance.showBulkOperationConfirmation(options);
            
            const cancelButton = document.querySelector('.modal-cancel-btn');
            cancelButton.click();
            
            // Modal should be removed
            setTimeout(() => {
                const modal = document.querySelector('.bulk-operation-modal-overlay');
                expect(modal).toBeNull();
            }, 300);
        });
        
        it('should handle ESC key for modal closing', () => {
            const options = {
                operation: 'test',
                title: 'Test',
                message: 'Test',
                icon: '⚠️',
                confirmText: 'Confirm',
                confirmClass: 'btn-primary',
                onConfirm: vi.fn()
            };
            
            integrationInstance.showBulkOperationConfirmation(options);
            
            // Simulate ESC key press
            const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            document.dispatchEvent(escEvent);
            
            // Modal should be removed
            setTimeout(() => {
                const modal = document.querySelector('.bulk-operation-modal-overlay');
                expect(modal).toBeNull();
            }, 300);
        });
    });
    
    describe('Error Handling in Bulk Operations', () => {
        it('should handle errors during sync operation', async () => {
            const handleErrorSpy = vi.spyOn(integrationInstance, 'handleError');
            const hideProgressSpy = vi.spyOn(integrationInstance, 'hideBulkOperationProgress');
            
            // Mock error in injectMKCGDataIntoPanel
            vi.spyOn(integrationInstance, 'injectMKCGDataIntoPanel').mockImplementation(() => {
                throw new Error('Test sync error');
            });
            
            integrationInstance.executeSyncAllTopics();
            
            // Wait for error handling
            await new Promise(resolve => setTimeout(resolve, 400));
            
            expect(handleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('Sync All execution failed'),
                'sync-all-execution',
                expect.any(Error)
            );
            expect(hideProgressSpy).toHaveBeenCalled();
        });
        
        it('should handle errors during clear operation', async () => {
            const handleErrorSpy = vi.spyOn(integrationInstance, 'handleError');
            
            // Mock error in clearAllTopicsContent
            window.clearAllTopicsContent = vi.fn(() => {
                throw new Error('Test clear error');
            });
            
            integrationInstance.executeClearAllTopics();
            
            // Wait for error handling
            await new Promise(resolve => setTimeout(resolve, 400));
            
            expect(handleErrorSpy).toHaveBeenCalled();
        });
        
        it('should handle errors during undo operation', async () => {
            // Set up invalid snapshot
            integrationInstance.bulkOperationHistory = [
                {
                    operation: 'test',
                    snapshot: null // Invalid snapshot
                }
            ];
            
            const handleErrorSpy = vi.spyOn(integrationInstance, 'handleError');
            
            integrationInstance.handleBulkUndo();
            
            // Wait for error handling
            await new Promise(resolve => setTimeout(resolve, 400));
            
            expect(handleErrorSpy).toHaveBeenCalled();
        });
    });
    
    describe('Integration with Auto-Save', () => {
        it('should trigger auto-save after bulk operations', async () => {
            integrationInstance.executeSyncAllTopics();
            
            // Wait for operation completion
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            expect(window.scheduleAutoSave).toHaveBeenCalled();
        });
        
        it('should show bulk operation feedback through global function', async () => {
            integrationInstance.executeSyncAllTopics();
            
            // Wait for operation completion
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            expect(window.showBulkOperationFeedback).toHaveBeenCalledWith(
                expect.stringContaining('All topics synced from MKCG data'),
                'success'
            );
        });
    });
});

/**
 * HELPER FUNCTIONS FOR BULK OPERATIONS TESTING
 */

/**
 * Simulate bulk operation completion
 */
async function waitForBulkOperation(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create mock topics data for testing
 */
function createMockTopicsData(count = 3) {
    const topics = [];
    for (let i = 0; i < count; i++) {
        topics.push({
            index: i,
            title: `Mock Topic ${i + 1}`,
            description: `Description for topic ${i + 1}`,
            icon: 'check'
        });
    }
    return topics;
}

/**
 * Simulate modal interaction
 */
function simulateModalConfirm() {
    const confirmButton = document.querySelector('.modal-confirm-btn');
    if (confirmButton) {
        confirmButton.click();
    }
}

function simulateModalCancel() {
    const cancelButton = document.querySelector('.modal-cancel-btn');
    if (cancelButton) {
        cancelButton.click();
    }
}

export {
    waitForBulkOperation,
    createMockTopicsData,
    simulateModalConfirm,
    simulateModalCancel
};
