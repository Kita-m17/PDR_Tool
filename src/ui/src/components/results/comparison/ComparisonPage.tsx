import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BaseRankDTO, EntailmentDTO, RankDTO } from '../../../api/api';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import StepControls from '../StepControls';
import Step1_CommonBaseRank from './steps/Step1_CommonBaseRank';
// import Step2_WhereMethodsDiffer from './steps/Step2_WhereMethodsDiffer';
// import Step3_InspectAlgorithms from './steps/Step3_InspectAlgorithms';
// import Step4_FinalKB from './steps/Step4_FinalKB';
// import Step5_FinalResults from './steps/Step5_FinalResults';
// import { Button } from '../../ui/Buttons';

interface ComparisonState {
    baseRank: BaseRankDTO;
    query: string;
    rcEntailment: EntailmentDTO;
    lcEntailment: EntailmentDTO;
    relcEntailment: EntailmentDTO;
};

const ComparisonPage: React.FC = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const {baseRank, query} = location.state as ComparisonState;

    const [currentStep, setCurrentStep] = useState(0);
    const [rcEntailment, setRcEntailment] = useState<EntailmentDTO | null>(null);
    const [lcEntailment, setLcEntailment] = useState<EntailmentDTO | null>(null);
    const [relcEntailment, setRelcEntailment] = useState<EntailmentDTO | null>(null);

    const [loading, setLoading] = useState(true);

    const totalSteps = 5;

    useEffect(() => {
        const fetchResults = async () => {
            try{
                setLoading(true);

                //rc
                const rcResults = await fetch('http://localhost:8080/api/entailment/rational', {
                    method: 'POST',
                    headers: {'Content-Type': 'test/plain'},
                    body: query,
                });

                const rc = await rcResults.json();
                setRcEntailment(rc);

                //lc
                const lcResults = await fetch('http://localhost:8080/api/entailment/lexicographic', {
                    method: 'POST',
                    headers: {'Content-Type': 'test/plain'},
                    body: query,
                });

                const lc = await lcResults.json();
                setLcEntailment(lc);

                //Minimal RelC - partition first, then entailment
                const partitionRes = await fetch('http://localhost:8080/api/partition/relevant/create/minimal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: query,
                });
                const partitionData = await partitionRes.json();

                const relcResults = await fetch('http://localhost:8080/api/entailment/minimal relevant', {
                    method: 'POST',
                    headers: {'Content-Type': 'test/plain'},
                    body: query,
                });
                const relc = await relcResults.json();
                setRelcEntailment(relc);

            } catch (error) {
                console.error('Error fetching entailment results:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    const steps = [
        <Step1_CommonBaseRank 
            baseRanking={baseRank.ranking} 
            query={query}
            onInspect = { () => navigate('/baseRank', { state: {baseRank, query, algorithm: 'rational', fromComparison: true } }) }
        
        />,
    ];

    if(loading){
        return (
            <div className="min-h-screen bg-accent flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground">
                        Loading comparison...
                    </p>
                </main>
                <Footer />
            </div>
        );
    }


    return(
        <div className="min-h-screen bg-accent flex flex-col">
            <Header />
            <main className = "flex-1 px-8 py-6">

                {/* Page header */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-foreground">
                        Comparison of Entailment Algorithms
                    </h1>

                    <p className="text-muted-foreground">
                        Same knowledge base. Same query. Different approaches.
                    </p>

                    {/* <p className="text-xs text-primary mt-2">
                        STEP {currentStep + 1} OF {totalSteps}
                    </p> */}
                </div>

                {/* Query banner
                <div className="bg-white border border-border rounded-xl p-4 mb-4 flex items-center gap-3">
                    <span className="text-primary font-bold text-sm">Query</span>
                    <span className="font-mono text-foreground">{query}</span>
                </div> */}

                {/* current step content */}
                <div className="mb-6">
                    {steps[currentStep]}
                </div>

                {/* step controls */}
                <div className="bg-white border border-border rounded-xl p-4">
                    <StepControls
                        current={currentStep}
                        total={totalSteps}
                        onStart={() => setCurrentStep(0)}
                        onBack={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                        onNext={() => setCurrentStep(prev => Math.min(totalSteps - 1, prev + 1))}
                        onEnd={() => setCurrentStep(totalSteps - 1)}
                    />
                </div>

            </main>
            <Footer/>
        </div>
    );
};

export default ComparisonPage;