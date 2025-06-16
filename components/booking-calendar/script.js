/**
 * Booking Calendar Component JavaScript
 */
class BookingCalendarComponent {
    constructor(element) {
        this.element = element;
        this.currentMonth = new Date();
        this.selectedDate = null;
        this.selectedTime = null;
        this.selectedService = null;
        this.services = [];
        this.availableDates = {};
        this.availableTimes = {};
        this.init();
    }

    init() {
        // Initialize component
        console.log('Booking Calendar component initialized');
        
        // Set today as default date
        this.currentMonth = new Date();
        
        // Initialize services if available
        const serviceOptions = this.element.querySelectorAll('.service-option');
        if (serviceOptions.length > 0) {
            this.selectedService = serviceOptions[0].dataset.serviceId;
        }
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Setup calendar button events
        const prevMonthBtn = this.element.querySelector('.prev-month-btn');
        const nextMonthBtn = this.element.querySelector('.next-month-btn');
        
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', this.handlePrevMonth.bind(this));
        }
        
        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', this.handleNextMonth.bind(this));
        }
        
        // Setup service selection
        const serviceOptions = this.element.querySelectorAll('.service-option');
        serviceOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove active class from all options
                serviceOptions.forEach(o => o.classList.remove('active'));
                
                // Add active class to selected option
                option.classList.add('active');
                
                // Update selected service
                this.selectedService = option.dataset.serviceId;
                
                // Update available dates and times based on selected service
                this.updateAvailability();
            });
        });
        
        // Setup calendar day selection
        const calendarDays = this.element.querySelectorAll('.calendar-day:not(.disabled)');
        calendarDays.forEach(day => {
            day.addEventListener('click', () => {
                // Remove active class from all days
                calendarDays.forEach(d => d.classList.remove('active'));
                
                // Add active class to selected day
                day.classList.add('active');
                
                // Update selected date
                const month = this.currentMonth.getMonth() + 1;
                const year = this.currentMonth.getFullYear();
                this.selectedDate = `${year}-${month}-${day.textContent}`;
                
                // Update selected date display
                const selectedDateDisplay = this.element.querySelector('.selected-date-value');
                if (selectedDateDisplay) {
                    const date = new Date(year, month - 1, parseInt(day.textContent));
                    selectedDateDisplay.textContent = date.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                    });
                }
                
                // Update time slots for selected date
                this.updateTimeSlots();
            });
        });
        
        // Setup time slot selection
        const timeSlots = this.element.querySelectorAll('.time-slot:not(.booked)');
        timeSlots.forEach(slot => {
            slot.addEventListener('click', () => {
                // Remove active class from all time slots
                timeSlots.forEach(t => t.classList.remove('active'));
                
                // Add active class to selected time slot
                slot.classList.add('active');
                
                // Update selected time
                this.selectedTime = slot.textContent;
                
                // Update selected time display
                const selectedTimeDisplay = this.element.querySelector('.selected-time-value');
                if (selectedTimeDisplay) {
                    selectedTimeDisplay.textContent = this.selectedTime;
                }
            });
        });
        
        // Setup booking form submission
        const bookingForm = this.element.querySelector('.booking-form');
        if (bookingForm) {
            bookingForm.addEventListener('submit', this.handleBookingSubmit.bind(this));
        }
        
        // Setup calendar settings button
        const setupCalendarBtn = this.element.querySelector('.setup-calendar-btn');
        if (setupCalendarBtn) {
            setupCalendarBtn.addEventListener('click', this.handleSetupCalendar.bind(this));
        }
        
        const editCalendarBtn = this.element.querySelector('.edit-calendar-btn');
        if (editCalendarBtn) {
            editCalendarBtn.addEventListener('click', this.handleEditCalendar.bind(this));
        }
    }
    
    handlePrevMonth() {
        this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
        this.updateCalendar();
    }
    
    handleNextMonth() {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
        this.updateCalendar();
    }
    
    updateCalendar() {
        // Update month display
        const currentMonthDisplay = this.element.querySelector('.current-month');
        if (currentMonthDisplay) {
            currentMonthDisplay.textContent = this.currentMonth.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
            });
        }
        
        // In a real implementation, this would update the calendar grid with the days
        // of the current month, marking available days, etc.
        console.log(`Calendar updated to ${this.currentMonth.toLocaleDateString()}`);
    }
    
    updateAvailability() {
        // In a real implementation, this would fetch available dates and times
        // for the selected service from the server
        console.log(`Updating availability for service ${this.selectedService}`);
        
        // Update calendar to show available dates
        this.updateCalendar();
    }
    
    updateTimeSlots() {
        // Update the time slots title
        const timeSlotsTitle = this.element.querySelector('.time-slots-title');
        if (timeSlotsTitle) {
            const date = new Date(this.selectedDate);
            timeSlotsTitle.textContent = `Available Times on ${date.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric' 
            })}`;
        }
        
        // In a real implementation, this would fetch and display available time slots
        // for the selected date and service
        console.log(`Updating time slots for date ${this.selectedDate}`);
    }
    
    handleBookingSubmit(e) {
        e.preventDefault();
        
        // Validate required fields
        const nameInput = this.element.querySelector('#booking-name');
        const emailInput = this.element.querySelector('#booking-email');
        const phoneInput = this.element.querySelector('#booking-phone');
        
        if (!nameInput.value || !emailInput.value || !phoneInput.value) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Validate selected date and time
        if (!this.selectedDate || !this.selectedTime) {
            alert('Please select a date and time for your appointment.');
            return;
        }
        
        // In a real implementation, this would submit the booking to the server
        console.log('Booking submitted:', {
            service: this.selectedService,
            date: this.selectedDate,
            time: this.selectedTime,
            name: nameInput.value,
            email: emailInput.value,
            phone: phoneInput.value,
            notes: this.element.querySelector('#booking-notes').value
        });
        
        // Show success message
        alert('Your appointment has been booked successfully!');
        
        // Reset form
        e.target.reset();
        
        // Reset selected date and time
        this.selectedDate = null;
        this.selectedTime = null;
        
        // Update displays
        const selectedDateDisplay = this.element.querySelector('.selected-date-value');
        const selectedTimeDisplay = this.element.querySelector('.selected-time-value');
        
        if (selectedDateDisplay) {
            selectedDateDisplay.textContent = 'Select a date';
        }
        
        if (selectedTimeDisplay) {
            selectedTimeDisplay.textContent = 'Select a time';
        }
        
        // Reset calendar and time slot selections
        const calendarDays = this.element.querySelectorAll('.calendar-day');
        calendarDays.forEach(day => day.classList.remove('active'));
        
        const timeSlots = this.element.querySelectorAll('.time-slot');
        timeSlots.forEach(slot => slot.classList.remove('active'));
    }
    
    handleSetupCalendar() {
        console.log('Setup calendar triggered');
        // In a real implementation, this would open a setup wizard for the calendar
        alert('This would open the calendar setup wizard in the real implementation.');
    }
    
    handleEditCalendar() {
        console.log('Edit calendar settings triggered');
        // In a real implementation, this would open the calendar settings editor
        alert('This would open the calendar settings editor in the real implementation.');
    }
}

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const bookingCalendarElements = document.querySelectorAll('.booking-calendar-component');
    bookingCalendarElements.forEach(element => {
        new BookingCalendarComponent(element);
    });
});