const fs = require('fs');
const path = require('path');

// Load data from JSON file
const dataPath = path.join(__dirname, 'trainings.txt');

let data;
try {
    const fileContent = fs.readFileSync(dataPath, 'utf8');
    data = JSON.parse(fileContent);
} catch (error) {
    console.error('Error reading or parsing the file:', error);
    process.exit(1);
}

// Function to count completed trainings
const countCompletedTrainings = (data) => {
    const trainingCounts = {};

    data.forEach(person => {
        const completions = person.completions || [];
        completions.forEach(training => {
            if (!trainingCounts[training.name]) {
                trainingCounts[training.name] = 0;
            }
            trainingCounts[training.name]++;
        });
    });

    return trainingCounts;
};

// Function to filter trainings by fiscal year
const filterTrainingsByFiscalYear = (data, trainings, fiscalYear) => {
    const startDate = new Date(fiscalYear - 1, 6, 1);
    const endDate = new Date(fiscalYear, 5, 30);
    const result = {};

    trainings.forEach(training => {
        result[training] = [];
    });

    data.forEach(person => {
        const completions = person.completions || [];
        completions.forEach(training => {
            if (trainings.includes(training.name)) {
                const completionDate = new Date(training.timestamp);
                if (completionDate >= startDate && completionDate <= endDate) {
                    result[training.name].push(person.name);
                }
            }
        });
    });

    return result;
};

// Function to find expired trainings
const findExpiredTrainings = (data, referenceDate) => {
    const reference = new Date(referenceDate);
    const oneMonthLater = new Date(reference);
    oneMonthLater.setMonth(reference.getMonth() + 1);
    const result = [];

    data.forEach(person => {
        const expiredTrainings = [];
        const completions = person.completions || [];
        completions.forEach(training => {
            if (training.expires) {
                const expirationDate = new Date(training.expires);
                if (expirationDate < reference) {
                    expiredTrainings.push({ name: training.name, status: 'expired' });
                } else if (expirationDate >= reference && expirationDate <= oneMonthLater) {
                    expiredTrainings.push({ name: training.name, status: 'expires soon' });
                }
            }
        });
        if (expiredTrainings.length > 0) {
            result.push({ name: person.name, trainings: expiredTrainings });
        }
    });

    return result;
};

// Generate outputs
const trainingCounts = countCompletedTrainings(data);
const specifiedTrainings = ["Electrical Safety for Labs", "X-Ray Safety", "Laboratory Safety Training"];
const fiscalYear = 2024;
const filteredTrainings = filterTrainingsByFiscalYear(data, specifiedTrainings, fiscalYear);
const referenceDate = '2023-10-01';
const expiredTrainings = findExpiredTrainings(data, referenceDate);

// Save outputs to JSON files
try {
    fs.writeFileSync('output1.json', JSON.stringify(trainingCounts, null, 4));
    fs.writeFileSync('output2.json', JSON.stringify(filteredTrainings, null, 4));
    fs.writeFileSync('output3.json', JSON.stringify(expiredTrainings, null, 4));
    console.log('Outputs have been generated and saved to output1.json, output2.json, and output3.json');
} catch (error) {
    console.error('Error writing output files:', error);
}