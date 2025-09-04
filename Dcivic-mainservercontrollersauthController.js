

// @desc    Get active workers for assignment
exports.getActiveWorkers = async (req, res) => {
    try {
        // Get only logged-in workers
        const activeWorkers = WORKER_CREDENTIALS.filter(worker => 
            loggedInWorkers.has(worker.employeeId)
        ).map(worker => ({
            employeeId: worker.employeeId,
            name: worker.name,
            specialization: worker.specialization,
            phone: worker.phone,
            email: worker.email
        }));

        console.log("Fetching active workers:", activeWorkers.length, "out of", WORKER_CREDENTIALS.length);

        res.json({
            success: true,
            workers: activeWorkers,
            count: activeWorkers.length
        });
    } catch (err) {
        console.error("Get active workers error:", err.message);
        res.status(500).json({
            success: false,
            msg: "Server Error"
        });
    }
};
