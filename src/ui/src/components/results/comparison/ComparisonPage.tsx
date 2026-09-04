import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BaseRankDTO, EntailmentDTO, RankDTO } from '../../../api/api';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import StepControls from '../StepControls';
import Step1_CommonBaseRank from './steps/Step1_CommonBaseRank';
import Step2_WhereMethodsDiffer from './steps/Step2_WhereMethodsDiffer';
import Step3_InspectAlgorithms from './steps/Step3_InspectAlgorithms';
import Step4_FinalKB from './steps/Step4_FinalKB';
import Step5_FinalResults from './steps/Step5_FinalResults';
import { Button } from '../../ui/Buttons';

interface ComparisonState {
    baseRank: BaseRankDTO;
    query: string;
    rcEntailment: EntailmentDTO;
    lcEntailment: EntailmentDTO;
    relcEntailment: EntailmentDTO;
};

const ComparisonPage: React.FC = () => {

    return(
        <div className="min-h-screen bg-accent flex flex-col">
            <Header />
            <main className = "flex-1 px-8 py-6">


            </main>
            <Footer/>
        </div>
    );
};