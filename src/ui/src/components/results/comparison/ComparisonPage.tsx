import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BaseRankDTO, EntailmentDTO, LexicographicEntailmentDTO, RankDTO } from '../../../api/api';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import StepControls from '../StepControls';
import Step1_CommonBaseRank from './steps/Step1_CommonBaseRank';
import Step2_WhereMethodsDiffer from './steps/Step2_WhereMethodsDiffer';
import Step3_InspectAlgos from './steps/Step3_InspectAlgos';
import Step4_FinalKB from './steps/Step4_FinalKB';
import Step5_FinalResults from './steps/Step5_FinalResults';
import { Button } from '../../ui/Buttons';
import { ArrowLeftIcon,ArrowRightIcon } from '@radix-ui/react-icons';

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
    const [rcResult, setRcResult] = useState<EntailmentDTO | null>(null);
    const [lcResult, setLcResult] = useState<LexicographicEntailmentDTO | null>(null);
    const [relcResult, setRelcResult] = useState<EntailmentDTO | null>(null);
    const [partition, setPartition] = useState<RankDTO | null>(null);

    const [loading, setLoading] = useState(true);



    useEffect(() => {
        const fetchResults = async () => {
            try{
                setLoading(true);

                //rc
                const rcResults = await fetch('http://localhost:8080/api/entailment/rational', {
                    method: 'POST',
                    headers: {'Content-Type': 'text/plain'},
                    body: query,
                });

                const rc = await rcResults.json();
                setRcResult(rc);

                //lc
                const lcResults = await fetch('http://localhost:8080/api/entailment/lexicographic', {
                    method: 'POST',
                    headers: {'Content-Type': 'text/plain'},
                    body: query,
                });

                const lc = await lcResults.json();
                setLcResult(lc);

                //Minimal RelC - partition first, then entailment
                const partitionRes = await fetch('http://localhost:8080/api/partition/relevant/create/minimal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: query,
                });
                const partitionData = await partitionRes.json();
                setPartition(partitionData); 

                const relcResults = await fetch('http://localhost:8080/api/entailment/minimal relevant', {
                    method: 'POST',
                    headers: {'Content-Type': 'text/plain'},
                    body: query,
                });
                const relc = await relcResults.json();
                setRelcResult(relc);

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
            onInspect = { () => navigate('/baserank', { state: {baseRank, query, algorithm: 'rational', fromComparison: true } }) } 
        />,

        <Step2_WhereMethodsDiffer />,

        <Step3_InspectAlgos
            baseRank={baseRank}
            query={query}
            rcResult={rcResult}
            lcResult={lcResult}
            relcResult={relcResult}
            // partition={partition}
            onInspectRC={() => navigate('/results/rational', { state: { baseRank, entailment: rcResult, partition, query, algorithm: 'rational', fromComparison: true } })}
            onInspectLC={() => navigate('/results/lexicographic', { state: { baseRank, entailment: lcResult, partition, query, algorithm: 'lexicographic', fromComparison: true } })}
            onInspectRelC={() => navigate('/results/relevant/minimal/partition', { state: { baseRank, entailment: relcResult, partition, query, algorithm: 'minimal relevant', fromComparison: true } })}
        />,

        <Step4_FinalKB
            baseRanking={baseRank.ranking}
            rcResult={rcResult}
            lcResult={lcResult}
            relcResult={relcResult}
        />,
        
        <Step5_FinalResults
            query={query}
            rcResult={rcResult}
            lcResult={lcResult}
            relcResult={relcResult}
        />,
    ];

    const totalSteps = steps.length;

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
                <div className="flex items-start justify-between mb-2">
                    <div>
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
 
                    <Button className="text-sm text-muted-foreground border border-border rounded-lg px-4 py-2 hover:bg-white transition" onClick={() => navigate('/baserank', {state: { baseRank, entailment: rcResult, query, algorithm: 'rational', fromComparison: true }})}>
                        <span className="flex items-center gap-1">
                            <ArrowLeftIcon className="h-3 w-3" />
                            Back to BaseRank
                        </span>
                    </Button>
                </div>

                {/* Query banner */}
                <div className="rounded-xl pt-6 mb-4 flex items-center gap-3">
                    <span className="text-primary font-bold text-sm">Query</span>
                    <span className="font-mono text-foreground">{query}</span>
                </div>

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

                {/* Done button, only on the final step */}
                {currentStep === totalSteps - 1 && (
                    <div className="flex justify-end mt-4">
                        <Button variant="primary" size="lg"
                            onClick={() => navigate('/')}
                        >
                            Done
                            <ArrowRightIcon className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                )}

            </main>
            <Footer/>
        </div>
    );
};

export default ComparisonPage;