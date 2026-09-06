import React, {useState} from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import FormulaCard from './components/input/FormulaCard';
import QueryInput from './components/input/QueryInput';
import EntailmentQueryCard from './components/input/EntailmentQueryCard';
import { Button } from './components/ui/Buttons';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import { submitKnowledgeBase, submitEvaluateAll, EvaluateAllResponseDTO } from './api/api';
import RCStepThrough from './components/results/rational/RCStepThrough';
import BasicRelevantStepThrough from './components/results/basic relevant/BasicRelevantStepThrough';
import BasicRelevantPartitionStepThrough from './components/results/basic relevant/BasicRelevantPartitionStepThrough';
import MinimalRelevantPartitionStepThrough from './components/results/minimal relevant/MinimalRelevantPartitionStepThrough';
import BaseRankStepThrough from './components/results/BaseRankStepThrough';
import LexicographicStepThrough from './components/results/lexicographic/LexicographicStepTrough';

const ALGORITHM_LABELS: Record<string, string> = {
  'rational': 'Rational Closure',
  'lexicographic': 'Lexicographic Closure',
  'basic relevant': 'Basic Relevant Closure',
  'minimal relevant': 'Minimal Relevant Closure',
};

interface InputPageProps {
  formulas: string[];
  setFormulas: (f: string[]) => void;
  query: string;
  setQuery: (q: string) => void;
  selectedAlgorithms: string[];
  setSelectedAlgorithms: (a: string[]) => void;
  evaluation: EvaluateAllResponseDTO | null;
  setEvaluation: (e: EvaluateAllResponseDTO | null) => void;
}

function InputPage({formulas, setFormulas, query, setQuery, selectedAlgorithms, setSelectedAlgorithms, evaluation, setEvaluation }: InputPageProps) {
  const navigate = useNavigate();
  const DEFAULT_FORMULAS = ['(bird|~flies)', '(penguin=>bird)', '(penguin|~!flies)'];
  const DEFAULT_QUERY = 'penguin|~!flies';
  const DEFAULT_ALGORITHMS = ['rational'];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEvaluate = async () => {
    if (formulas.length === 0) {
      setError('Please enter a knowledge base');
      return;
    }

    if (!query) {
      setError('Please enter a query');
      return;
    }

    if (selectedAlgorithms.length === 0) {
      setError('Please select at least one algorithm');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await submitKnowledgeBase(formulas);
      const result = await submitEvaluateAll(query, selectedAlgorithms);
      setEvaluation(result);
    } catch (err) {
      setError('Something went wrong. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormulas(DEFAULT_FORMULAS);
    setQuery(DEFAULT_QUERY);
    setSelectedAlgorithms(DEFAULT_ALGORITHMS);
    setEvaluation(null);
  };

  const goToAlgorithm = (algorithm: string) => {
    if (!evaluation) return;
    const result = evaluation.results.find((r) => r.algorithm === algorithm);
    if (!result) return;

    navigate('/baserank', {
      state: {
        baseRank: evaluation.baseRank,
        entailment: result.entailment,
        partition: result.partition,
        query,
        algorithm: result.algorithm,
      }
    });
  };

  return (
    <div className="min-h-screen bg-accent flex flex-col">
      <Header />

      <main className="flex-1 px-8 py-8">

        {/* Top row: KB and Query side by side */}
        <div className="flex gap-6 mb-6">
          
          {/* KB Card — wider */}
          <div className="mb-4 bg-white rounded-xl border border-border shadow-sm p-6 flex-[2]">
            <FormulaCard onSubmit={setFormulas} defaultValue={formulas.join(',')}
                onLoadExample={(exampleFormulas, exampleQuery, exampleAlgorithm) => {
                    setFormulas(exampleFormulas);
                    setQuery(exampleQuery);
                    setSelectedAlgorithms([exampleAlgorithm]);
                    setEvaluation(null);
                }}
            />
          </div>

          {/* Query Card — narrower */}
          <div className="mb-4 mt-2 bg-white rounded-xl border border-border shadow-sm p-6 flex-[1]">
            <QueryInput onSubmit={setQuery} defaultValue={query}/>
          </div>
        </div>
        
        {/* Algorithm selection */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6 mt-2"> 
          <EntailmentQueryCard selected={selectedAlgorithms} onAlgorithmChange={setSelectedAlgorithms}/> 
        </div>

        {/* Error message */}
        {error && (
          <p className="text-red-500 text-sm mt-4 text-right">
            {error}
          </p>
        )}

        {/* Result buttons — one per evaluated algorithm */}
        {evaluation && evaluation.results.length > 0 && (
          <div className="bg-white rounded-xl border border-border shadow-sm p-6 mt-6">
            <h2 className="text-primary font-semibold mb-1">
              Results
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              Select an algorithm below to step through its evaluation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {evaluation.results.map((result) => {
                const hasPartition = result.partition !== null && result.partition !== undefined
                  && result.entailment.partitionExecutionTime !== undefined;

                const entailed = result.entailment.entailed;

                return (
                  <button
                    key={result.algorithm}
                    onClick={() => goToAlgorithm(result.algorithm)}
                    className={`flex flex-col items-start text-left border rounded-lg px-4 py-3 transition-colors ${
                      entailed
                        ? 'bg-green-50 hover:bg-green-100 border-green-300'
                        : 'bg-red-50 hover:bg-red-100 border-red-300'
                    }`}
                  >
                    <span className="flex items-center justify-between w-full mb-2 gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        {ALGORITHM_LABELS[result.algorithm] ?? result.algorithm}
                      </span>
                      <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full whitespace-nowrap ${
                        entailed ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                      }`}>
                        {entailed ? 'Entails' : 'Does not entail'}
                      </span>
                    </span>

                    <span className="flex flex-col gap-1 text-xs text-muted-foreground w-full">
                      <span className="flex justify-between gap-2">
                        <span>Base rank</span>
                        <span>{result.entailment.baseRankExecutionTime.toFixed(3)}s</span>
                      </span>
                      <span className="flex justify-between gap-2">
                        <span>Closure</span>
                        <span>{result.entailment.closureExecutionTime.toFixed(3)}s</span>
                      </span>
                      {hasPartition && (
                        <span className="flex justify-between gap-2">
                          <span>Partition</span>
                          <span>{result.entailment.partitionExecutionTime?.toFixed(3)}s</span>
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Evaluate button */}
        <div className="flex justify-end flex-col items-end mt-6">
          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={handleReset}>
                Reset to Defaults
            </Button>

            <Button variant="primary" size="lg" onClick={handleEvaluate} disabled={loading}>
                {loading ? 'Evaluating...' : 'Evaluate'}
                <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    <Footer/>
  </div>
  );
}

function App(){
  const [formulas, setFormulas] = useState<string[]>(['(bird|~flies)', '(penguin=>bird)', '(penguin|~!flies)']);
  const [query, setQuery] = useState('penguin|~!flies');
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>(['rational']);
  const [evaluation, setEvaluation] = useState<EvaluateAllResponseDTO | null>(null);

  return(
    <Routes>
      <Route path="/" element={
        <InputPage 
          formulas={formulas}
          setFormulas={setFormulas}
          query={query}
          setQuery={setQuery}
          selectedAlgorithms={selectedAlgorithms}
          setSelectedAlgorithms={setSelectedAlgorithms}
          evaluation={evaluation}
          setEvaluation={setEvaluation}
        />
      }/>
      <Route path="/baserank" element={<BaseRankStepThrough />} />
      <Route path="/results/rational" element = {<RCStepThrough/>}/>
      <Route path="/results/relevant/basic" element = {<BasicRelevantStepThrough/>}/>
      <Route path="/results/lexicographic" element={<LexicographicStepThrough/>}/>
      <Route path="/results/relevant/basic/partition" element = {<BasicRelevantPartitionStepThrough/>}/>
      <Route path="/results/relevant/minimal/partition" element = {<MinimalRelevantPartitionStepThrough/>}/>
    </Routes>
  )
}

export default App;
