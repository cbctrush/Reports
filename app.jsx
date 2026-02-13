import React, { useState, useEffect } from 'react';
import { Printer, Upload, Sparkles, Loader2, Activity } from 'lucide-react';

// --- TEMPLATES ---
const procedures = {
  consultation: {
    label: "Consultation",
    template: (data) => `Je vous remercie de m'avoir référé ${data.patientName}.
    
J'ai eu le plaisir de voir votre patient(e) pour une consultation concernant la dent ${data.tooth}.
L'examen clinique et radiologique confirme un diagnostic de ${data.diagnosis.toLowerCase()}.
Le pronostic est ${data.prognosis.toLowerCase()}.

Je recommande : ${data.plan}.`
  },
  rct: {
    label: "Traitement de Canal (RCT)",
    template: (data) => `Je vous remercie de m'avoir référé ${data.patientName}.

J'ai complété le traitement endodontique de la dent ${data.tooth}.
Le traitement a été effectué sous digue dentaire et microscope opératoire.
Les canaux ont été instrumentés, désinfectés et obturés tridimensionnellement.
La chambre pulpaire a été scellée avec un matériau provisoire.`
  },
  retreatment: {
    label: "Retraitement",
    template: (data) => `Je vous remercie de m'avoir référé ${data.patientName}.

J'ai complété le retraitement endodontique de la dent ${data.tooth}.
L'ancienne obturation a été retirée, la perméabilité rétablie, et une désinfection rigoureuse effectuée avant l'obturation finale.`
  },
  surgery: {
    label: "Microchirurgie (Apico)",
    template: (data) => `Je vous remercie de m'avoir référé ${data.patientName}.

Une microchirurgie endodontique a été réalisée sur la dent ${data.tooth}.
L'apex a été réséqué et une obturation rétrograde (Biocéramique) a été placée.
Les sutures devront être retirées dans 3 à 5 jours.`
  }
};

const App = () => {
  const [formData, setFormData] = useState({
    refDr: '',
    patientName: '',
    patientDOB: '',
    tooth: '',
    diagnosis: 'Pulpite irréversible',
    prognosis: 'Bon',
    plan: 'Traitement endodontique',
    procedureType: 'rct',
    notes: ''
  });

  const [preOp, setPreOp] = useState(null);
  const [postOp, setPostOp] = useState(null);
  const [isRewriting, setIsRewriting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'pre') setPreOp(reader.result);
        if (type === 'post') setPostOp(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRewrite = async () => {
    if (!formData.notes) return;
    setIsRewriting(true);
    
    try {
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          notes: formData.notes,
          patientName: formData.patientName 
        })
      });
      
      const data = await response.json();
      if (data.output) {
        setFormData(prev => ({ ...prev, notes: data.output }));
      }
    } catch (error) {
      console.error("AI Error:", error);
      alert("Erreur: Assurez-vous que l'API est configurée.");
    } finally {
      setIsRewriting(false);
    }
  };

  const styles = {
    container: { maxWidth: '1100px', margin: '0 auto', padding: '20px', fontFamily: 'Segoe UI, sans-serif', color: '#333' },
    header: { textAlign: 'center', marginBottom: '30px', color: '#2563eb' },
    grid: { display: 'grid', gridTemplateColumns: '400px 1fr', gap: '40px' },
    controlPanel: { background: '#f8fafc', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', height: 'fit-content' },
    inputGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9em', color: '#475569' },
    input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' },
    select: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', fontSize: '14px' },
    textarea: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '100px', fontFamily: 'inherit', resize: 'vertical' },
    aiButton: { background: '#8b5cf6', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85em', display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' },
    printButton: { background: '#2563eb', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '16px', fontWeight: 'bold', width: '100%', marginTop: '20px', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' },
    letter: { background: 'white', padding: '60px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', borderRadius: '4px', minHeight: '800px', position: 'relative' },
    letterHeader: { borderBottom: '2px solid #333', paddingBottom: '20px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
    letterBody: { lineHeight: '1.8', fontSize: '11pt', whiteSpace: 'pre-wrap' },
    xrayContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '40px', pageBreakInside: 'avoid' },
    xrayBox: { border: '1px solid #e2e8f0', background: '#f8fafc', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', overflow: 'hidden' },
    img: { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }
  };

  return (
    <div className="app-container" style={styles.container}>
      <style>{`
        @media print {
          @page { margin: 2cm; size: auto; }
          body { background: white; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .app-container { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          div[style*="gridTemplateColumns"] { display: block !important; }
          div[style*="boxShadow"] { box-shadow: none !important; border: none !important; padding: 0 !important; }
        }
      `}</style>

      <div style={styles.header} className="no-print">
        <h1><Activity style={{verticalAlign:'middle', marginRight:'10px'}}/>Générateur de Rapports Endo</h1>
      </div>

      <div style={styles.grid}>
        <div style={styles.controlPanel} className="no-print">
          <div style={styles.inputGroup}>
            <label style={styles.label}>Dentiste Référent</label>
            <input style={styles.input} name="refDr" placeholder="Dr. Tremblay" value={formData.refDr} onChange={handleChange} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Patient</label>
            <input style={styles.input} name="patientName" placeholder="Jean Dupont" value={formData.patientName} onChange={handleChange} />
          </div>
          <div style={{display:'flex', gap:'10px'}}>
             <div style={styles.inputGroup}>
               <label style={styles.label}>Dent #</label>
               <input style={styles.input} name="tooth" placeholder="36" value={formData.tooth} onChange={handleChange} />
             </div>
             <div style={styles.inputGroup}>
               <label style={styles.label}>Date Naissance</label>
               <input style={styles.input} type="date" name="patientDOB" value={formData.patientDOB} onChange={handleChange} />
             </div>
          </div>
          <hr style={{margin: '25px 0', border: '0', borderTop: '1px solid #e2e8f0'}} />
          <div style={styles.inputGroup}>
            <label style={styles.label}>Procédure</label>
            <select style={styles.select} name="procedureType" value={formData.procedureType} onChange={handleChange}>
              {Object.entries(procedures).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
          <div style={styles.inputGroup}>
             <label style={styles.label}>Images (X-Rays)</label>
             <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
               <button style={{...styles.select, textAlign:'left', cursor:'pointer'}} onClick={() => document.getElementById('pre-upload').click()}>
                 <Upload size={14} style={{verticalAlign:'middle'}}/> {preOp ? "Pré-Op chargé ✅" : "Charger Pré-Op"}
               </button>
               <input id="pre-upload" type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(e, 'pre')} />

               <button style={{...styles.select, textAlign:'left', cursor:'pointer'}} onClick={() => document.getElementById('post-upload').click()}>
                 <Upload size={14} style={{verticalAlign:'middle'}}/> {postOp ? "Post-Op chargé ✅" : "Charger Post-Op"}
               </button>
               <input id="post-upload" type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(e, 'post')} />
             </div>
          </div>
          <div style={styles.inputGroup}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                <label style={styles.label}>Notes Cliniques</label>
                <button onClick={handleRewrite} disabled={isRewriting} style={styles.aiButton}>
                  {isRewriting ? <Loader2 className="animate-spin" size={14}/> : <Sparkles size={14}/>}
                  {isRewriting ? "Réécriture..." : "Améliorer (IA)"}
                </button>
            </div>
            <textarea 
              style={styles.textarea} 
              name="notes" 
              value={formData.notes}
              placeholder="Ex: Canaux calcifiés, patient anxieux, MB2 trouvé..." 
              onChange={handleChange} 
            />
          </div>
          <button style={styles.printButton} onClick={handlePrint}>
            <Printer size={2