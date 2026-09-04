import React, {useState} from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import FormulaCard from './components/input/FormulaCard';
import QueryInput from './components/input/QueryInput';
import EntailmentQueryCard from './components/input/EntailmentQueryCard';
import { Button } from './components/ui/Buttons';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import { submitKnowledgeBase, submitQuery, submitPartitionQuery, submitMinimalPartitionQuery, BaseRankDTO, EntailmentDTO } from './api/api';
import RCStepThrough from './components/results/rational/RCStepThrough';
import BasicRelevantStepThrough from './components/results/basic relevant/BasicRelevantStepThrough';
import BasicRelevantPartitionStepThrough from './components/results/basic relevant/BasicRelevantPartitionStepThrough';
import MinimalRelevantPartitionStepThrough from './components/results/minimal relevant/MinimalRelevantPartitionStepThrough';
import BaseRankStepThrough from './components/results/BaseRankStepThrough';
import LexicographicStepThrough from './components/results/lexicographic/LexicographicStepTrough';

interface InputPageProps {
  formulas: string[];
  setFormulas: (f: string[]) => void;
  query: string;
  setQuery: (q: string) => void;
  algorithm: string;
  setAlgorithm: (a: string) => void;
}

function InputPage({formulas, setFormulas, query, setQuery, algorithm, setAlgorithm }: InputPageProps) {
  const navigate = useNavigate();
  const DEFAULT_FORMULAS = ['(bird~|flies)', '(penguin=>bird)', '(penguin~|!flies)'];
  const DEFAULT_QUERY = 'penguin~|!flies';

  // const [formulas, setFormulas] = useState<string[]>(['(bird~|flies)', '(penguin=>bird)', '(penguin~|!flies)']);
  // const [query, setQuery] = useState('penguin~|!flies');
   //const [algorithm, setAlgorithm] = useState('rational');
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
      const baseRank = await submitKnowledgeBase(formulas);
      const partition = algorithm === 'minimal relevant'
        ? await submitMinimalPartitionQuery(query)
        : await submitPartitionQuery(query);
      const entailment = await submitQuery(algorithm, query);

      navigate('/baserank', {
        state: { baseRank, entailment, partition, query, algorithm }
      });

    } catch (err) {
      setError('Something went wrong. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormulas(DEFAULT_FORMULAS);
    setQuery(DEFAULT_QUERY);
    setAlgorithm('rational');
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
                    setAlgorithm(exampleAlgorithm);
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
          <EntailmentQueryCard selected={algorithm} onAlgorithmChange={setAlgorithm}/> 
        </div>

        {/* Error message */}
        {error && (
          <p className="text-red-500 text-sm mt-4 text-right">
            {error}
          </p>
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
  const [formulas, setFormulas] = useState<string[]>(['(bird~|flies)', '(penguin=>bird)', '(penguin~|!flies)']);
  const [query, setQuery] = useState('penguin~|!flies');
  const [algorithm, setAlgorithm] = useState('rational');

  return(
    <Routes>
      <Route path="/" element={
        <InputPage 
          formulas={formulas}
          setFormulas={setFormulas}
          query={query}
          setQuery={setQuery}
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
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
