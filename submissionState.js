let submissionsEnabled = true;

module.exports = {
    isSubmissionsEnabled: () => submissionsEnabled,
    disableSubmissions: () => { submissionsEnabled = false; },
    enableSubmissions: () => { submissionsEnabled = true; },
    toggleSubmissions: () => { submissionsEnabled = !submissionsEnabled; },
};
