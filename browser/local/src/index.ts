interface BackgroundEdgeData {
    type: 'Background';
    steps: TStep[];
}

interface TStep {
    gwta: string;
    vars: {
        message: {
            type: string;
            source: 'env';
        };
    };
}

function readBackgrounds(): BackgroundEdgeData[] {
    // Mock data for background edges
    const backgroundEdges: BackgroundEdgeData[] = [
        {
            type: 'Background',
            steps: [
                {
                    gwta: 'Fail with {message}',
                    vars: {
                        message: {
                            type: 'string',
                            source: 'env',
                        },
                    },
                },
                // Add more steps as needed
            ],
        },
        {
            type: 'Background',
            steps: [
                {
                    gwta: 'Another step with {message}',
                    vars: {
                        message: {
                            type: 'string',
                            source: 'env',
                        },
                    },
                },
                // Add more steps as needed
            ],
        },
        // Add more background edges as needed
    ];

    return backgroundEdges;
}

// Usage example:
const backgroundData = readBackgrounds();
console.log(backgroundData);
