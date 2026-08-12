import React, {useState} from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import FormulaCard from './components/input/FormulaCard';
import QueryInput from './components/input/QueryInput';
import EntailmentQueryCard from './components/input/EntailmentQueryCard';
import { Button } from './components/ui/Buttons';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import { submitKnowledgeBase, submitQuery, BaseRankDTO, EntailmentDTO } from './api/api';

function App() {
  const [formulas, setFormulas] = useState<string[]>(['(bird~|flies)', '(penguin=>bird)', '(penguin~|!flies)']);
  const [query, setQuery] = useState('');
  const [algorithm, setAlgorithm] = useState('rational');
  const [baseRankResult, setBaseRankResult] = useState<BaseRankDTO | null>(null);
  const [entailmentResult, setEntailmentResult] = useState<EntailmentDTO | null>(null);
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

    setLoading(true);
    setError(null);

    try {
      // 1. submit KB, get BaseRank trace
      const baseRank = await submitKnowledgeBase(formulas);
      setBaseRankResult(baseRank);

      // 2. submit query, get entailment trace
      const entailment = await submitQuery(algorithm, query);
      setEntailmentResult(entailment);

    } catch (err) {
      setError('Something went wrong. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-accent flex flex-col">
      <Header />
      <main className="flex-1 px-8 py-8">

        {/* Top row: KB and Query side by side */}
        <div className="flex gap-6 mb-6">
          
          {/* KB Card — wider */}
          <div className="mb-4 bg-white rounded-xl border border-border shadow-sm p-6 flex-[2]">
            <FormulaCard onSubmit={setFormulas} />
          </div>

          {/* Query Card — narrower */}
          <div className="mb-4 mt-2 bg-white rounded-xl border border-border shadow-sm p-6 flex-[1]">
            <QueryInput onSubmit={setQuery} />
          </div>
        </div>
        
        {/* Algorithm selection */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6 mt-2"> 
          <EntailmentQueryCard 
            selected={algorithm}
            onAlgorithmChange={setAlgorithm}
          /> 
        </div>

        {/* Error message */}
        {error && (
          <p className="text-red-500 text-sm mt-4 text-right">
            {error}
          </p>
        )}

        {/* Evaluate button */}
        <div className="flex justify-end flex-col items-end mt-6">
            <Button
                // type="submit"
                variant="primary"
                size="lg"
                onClick={handleEvaluate}
                disabled={loading}
            >
                {loading ? 'Evaluating...' : 'Evaluate'}
                <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>

            <p className="text-xs text-muted-foreground mt-1">
                Proceed to step-by-step evaluation.
            </p>
        </div>

        {/* Results — placeholder for now */}
        {baseRankResult && (
          <div className="mt-8 bg-white rounded-xl border border-border shadow-sm p-6">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(baseRankResult, null, 2)}
            </pre>
          </div>
        )}

        {entailmentResult && (
          <div className="mt-4 bg-white rounded-xl border border-border shadow-sm p-6">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(entailmentResult, null, 2)}
            </pre>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}

export default App;
