import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { analyzeDemandWithGemini } from '../../services/geminiService';
import { AiDemandAnalysis } from '../../types';
import { AiRecommendationCard } from '../../components/vendor/AiRecommendationCard';
import {
  Sparkles,
  Bot,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  Database,
  ArrowRight,
  TrendingUp,
  Cpu,
  ShieldCheck,
} from 'lucide-react';

export const VendorAiAssistantPage: React.FC = () => {
  const { inventory, orders, outlets } = useApp();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AiDemandAnalysis | null>(null);
  const [selectedOutlet, setSelectedOutlet] = useState<string>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const result = await analyzeDemandWithGemini(
        inventory,
        orders,
        selectedOutlet === 'all' ? undefined : selectedOutlet
      );
      setAnalysisResult(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Demand analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="app-main">
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', marginBottom: 2 }}>
          <Sparkles size={16} />
          <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Gemini-Powered Intelligence
          </span>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>AI Demand Assistant</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Real-time demand prediction & agentic restocking recommendations
        </p>
      </div>

      {/* Outlet Selector */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
        <button
          onClick={() => setSelectedOutlet('all')}
          className={`category-pill ${selectedOutlet === 'all' ? 'active' : ''}`}
        >
          All Outlets
        </button>
        {outlets.map((o) => (
          <button
            key={o.id}
            onClick={() => setSelectedOutlet(o.id)}
            className={`category-pill ${selectedOutlet === o.id ? 'active' : ''}`}
          >
            {o.name}
          </button>
        ))}
      </div>

      {/* Primary Action Card */}
      <div
        className="card-base"
        style={{
          background: 'linear-gradient(135deg, #FFF9F3 0%, #FFF3E6 100%)',
          border: '1.5px solid #FDBA74',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #F68920 0%, #D86B07 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(246, 137, 32, 0.3)',
            }}
          >
            <Bot size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)' }}>
              Campus Demand & Stock Forecast
            </h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Analyzes live order rates, hourly velocity, and stock depletion
            </span>
          </div>
        </div>

        {/* Explain Agentic Workflow */}
        <div
          style={{
            background: 'white',
            borderRadius: 14,
            padding: 12,
            border: '1px solid var(--border-subtle)',
            fontSize: 11,
            color: 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <strong style={{ color: 'var(--text-main)' }}>Agentic Intelligence Pipeline:</strong>
          <span>1. <code>getInventory()</code> reads live stock from shared state.</span>
          <span>2. <code>getRecentOrders()</code> evaluates lunch rush consumption velocity.</span>
          <span>3. Gemini API models shortage risk & calculates refill batches.</span>
          <span>4. Vendor retains full control with one-click approval.</span>
        </div>

        {/* Trigger Button */}
        <button
          className="btn-primary"
          disabled={isAnalyzing}
          onClick={handleRunAnalysis}
          style={{ width: '100%', padding: '14px', fontSize: 14 }}
        >
          {isAnalyzing ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              Analyzing current demand with Gemini API...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Analyze Demand with AI
            </>
          )}
        </button>
      </div>

      {errorMessage && (
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            background: '#FEF2F2',
            color: '#DC2626',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <AlertTriangle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Analysis Results Display */}
      {analysisResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Executive Summary Card */}
          <div
            className="card-base"
            style={{
              padding: 16,
              background: 'white',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Cpu size={15} color="var(--primary)" />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
                  Analysis Engine
                </span>
              </div>

              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 9999,
                  background: analysisResult.liveApiUsed ? '#ECFDF5' : '#FFFBEB',
                  color: analysisResult.liveApiUsed ? '#059669' : '#D97706',
                  border: analysisResult.liveApiUsed ? '1px solid #A7F3D0' : '1px solid #FDE68A',
                }}
              >
                {analysisResult.liveApiUsed ? 'LIVE GEMINI API' : 'INTELLIGENT HEURISTIC'}
              </span>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-main)', lineHeight: 1.4, fontWeight: 600 }}>
              {analysisResult.summary}
            </p>

            <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 11, color: 'var(--text-light)' }}>
              <span>Engine: <strong>{analysisResult.engine}</strong></span>
              <span>Updated: {new Date(analysisResult.analyzedAt).toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Action Recommendations List */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>
              Restock Recommendations ({analysisResult.items.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {analysisResult.items.map((recItem, idx) => (
                <AiRecommendationCard key={idx} item={recItem} />
              ))}
            </div>
          </div>

          {/* Agent Action Plan */}
          {analysisResult.agentActionPlan && (
            <div
              className="card-base"
              style={{
                padding: 14,
                background: 'var(--bg-muted)',
                fontSize: 12,
              }}
            >
              <h4 style={{ fontSize: 13, fontWeight: 800, marginBottom: 6, color: 'var(--text-main)' }}>
                Recommended Operational Action Plan
              </h4>
              <ul style={{ paddingLeft: 18, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {analysisResult.agentActionPlan.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Faculty Presentation Flow Guide */}
      <div
        className="card-base"
        style={{
          padding: 14,
          background: 'var(--bg-app)',
          border: '1px dashed var(--border-subtle)',
          fontSize: 11,
          color: 'var(--text-muted)',
          lineHeight: 1.45,
        }}
      >
        <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>
          Faculty Demonstration Scenario:
        </strong>
        <span>
          1. Student buys 2 Chicken Fry ➔ Stock drops from 10 to 8 (Status: Low Stock).
          <br />
          2. Vendor clicks <strong>Analyze Demand with AI</strong> ➔ Gemini analyzes real data & flags High Shortage Risk.
          <br />
          3. Vendor clicks <strong>Add Recommended Stock</strong> ➔ Inventory increments to 28 portions (Status: Available).
        </span>
      </div>
    </div>
  );
};
