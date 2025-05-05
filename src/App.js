import React, { useRef, useState, useEffect } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';
import SignatureCanvas from 'react-signature-canvas'; 
import { Html5Qrcode } from 'html5-qrcode';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BrowserQRCodeReader } from '@zxing/browser';




// Blocos estruturados
const blocos = {
  Funcionamento: {
    'Pré-Análise': [
      { label: 'Não liga (Inoperante)', name: 'naoLiga' },
      { label: 'Desliga sozinho (Standby)', name: 'desligaSozinho' },
      { label: 'Liga/Desliga intermitente', name: 'ligaDesligaIntermitente' },
      { label: 'Sem imagem', name: 'semImagem' },
      { label: 'Sem som', name: 'semSom' },
    ],
    'Funções': [
      { label: 'Teste do Jog Function (Falha)', name: 'jogFunctionFalha' },
      { label: 'Teste do Jog Function (Normal)', name: 'jogFunctionNormal' },
    ],
    'Controle Remoto': [
      { label: 'Pareamento Falha', name: 'controleFalha' },
      { label: 'Pareamento Ausente', name: 'controleAusente' },
      { label: 'Pareamento Normal', name: 'controleNormal' },
    ],
    'Cabos': [
      { label: 'Cabo força Falha', name: 'caboForcaFalha' },
      { label: 'Cabo força Ausente', name: 'caboForcaAusente' },
      { label: 'Cabo força Normal', name: 'caboForcaNormal' },
      { label: 'Cabo One Connect Falha', name: 'caboOneConnectFalha' },
      { label: 'Cabo One Connect Ausente', name: 'caboOneConnectAusente' },
      { label: 'Cabo One Connect Normal', name: 'caboOneConnectNormal' },
    ],
  },
  Imagem: {
    'Executar Test Pattern': [
      { label: 'Pixel Apagado / Aceso', name: 'pixelApagado' },
      { label: 'Impurezas (Resíduos internos)', name: 'impurezas' },
      { label: 'Partes Escuras', name: 'partesEscuras' },
      { label: 'Burn-in (padrão vermelho)', name: 'burnIn' },
      { label: 'Linhas Horizontais', name: 'linhasHorizontais' },
      { label: 'Linhas Verticais', name: 'linhasVerticais' },
    ],
    'Imagem em todas as entradas': [
      { label: 'HDMI 1 NOK', name: 'hdmi1nok' },
      { label: 'HDMI 2 NOK', name: 'hdmi2nok' },
      { label: 'HDMI 3 NOK', name: 'hdmi3nok' },
      { label: 'HDMI 4 NOK', name: 'hdmi4nok' },
      { label: 'RF Falha', name: 'rfFalha' },
      { label: 'RF Normal', name: 'rfNormal' },
    ],
  },
  Audio: {
    'Auto Falantes': [
      { label: 'Som Intermitente', name: 'somIntermitente' },
      { label: 'Som distorcido / ruído / vibração', name: 'somDistorcido' },
    ],
    'Audio em todas as entradas': [
      { label: 'HDMI 1 NOK', name: 'shdmi1nok' },
      { label: 'HDMI 2 NOK', name: 'shdmi2nok' },
      { label: 'HDMI 3 NOK', name: 'shdmi3nok' },
      { label: 'HDMI 4 NOK', name: 'shdmi4nok' },
      { label: 'RF Falha', name: 'srfFalha' },
      { label: 'RF Normal', name: 'srfNormal' },
    ],
  },
  Rede: {
    ' Cabo (RJ45) /Wireless': [
      { label: 'FALHA -Conexão com internet - Cabo', name: 'internetCabo' },
      { label: 'FALHA -Conexão com internet - Wireless', name: 'internetWifi' },
      { label: 'FALHA -Teste de acesso ao Netflix', name: 'netflix' },
      { label: 'FALHA -Teste de acesso ao Youtube', name: 'youtube' },
    ]
  }
};


const styles = {
  container: {
    padding: '20px',
    maxWidth: '600px',
    margin: 'auto',
    fontFamily: 'Arial, sans-serif'
  },
  input: {
    width: '100%',
    padding: '10px',
    margin: '5px 0',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '16px'
  },
  select: {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '16px'
  },
  textarea: {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '16px',
    resize: 'vertical'
  },
  buttonPrimary: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    margin: '10px 5px 0 0',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  buttonSecondary: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    margin: '10px 5px 0 0',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  buttonDanger: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    margin: '10px 5px 0 0',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  signatureCanvas: {
    border: '1px solid #ccc',
    borderRadius: '8px',
    width: '100%',
    height: '150px',
    backgroundColor: '#fff',
    marginTop: '10px'
  }
};

function App() {
  const codeReader = new BrowserMultiFormatReader();
const videoRef = useRef(null);
const fileInputRef = useRef();


const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async () => {
      const imageBuffer = reader.result;
      const codeReader = new BrowserQRCodeReader();
      try {
        const result = await codeReader.decodeFromImage(undefined, imageBuffer);
        setFormHeaderData((prev) => ({
          ...prev,
          numeroSerie: result.getText()
        }));
      } catch (err) {
        console.error('Falha ao ler código:', err);
      }
    };
    reader.readAsDataURL(file);
  }
};

  const [selectedBlock, setSelectedBlock] = useState('');
  const [formData, setFormData] = useState({});
  const [formHeaderData, setFormHeaderData] = useState({
    cliente: '',
    modelo: '',
    numeroOS: '',
    numeroSerie: '',
    dataVisita: '',
    versao: '',
    nomeTecnico:'',
  });

  const startScanner = () => {
    const html5QrCode = new Html5Qrcode("reader");
    html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: 250
      },
      (decodedText) => {
        setFormHeaderData((prev) => ({
          ...prev,
          numeroSerie: decodedText
        }));
        html5QrCode.stop();
      },
      (errorMessage) => {
        console.warn(errorMessage);
      }
    ).catch((err) => {
      console.error(err);
    });
  };
  

  const [observacoes, setObservacoes] = useState('');
  const signatureRef = useRef(null);


  const handleBlockChange = (e) => {
    setSelectedBlock(e.target.value);
    setFormData({}); // Limpar quando muda o bloco
  };

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setFormHeaderData(prev => ({ ...prev, [name]: value }));
  };

  const clearAll = () => {
    setFormData({});
    setFormHeaderData({
      cliente: '',
      modelo: '',
      numeroOS: '',
      numeroSerie: '',
      dataVisita: '',
      versao: '',
      nometecnico:'',
    });
    setObservacoes('');
    signatureRef.current.clear();
    setSelectedBlock('');
  };
  
  const clearSignature = () => {
    signatureRef.current.clear();
  };
  const generatePDF = async () => {
    const existingPdfBytes = await fetch('/Checklist DTV CI 9.1(1)(1).pdf').then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const { width, height } = firstPage.getSize();

    // Cabeçalho preenchendo
    firstPage.drawText(formHeaderData.cliente, { x: 95, y: height - 80, size: 10, font });
    firstPage.drawText(formHeaderData.modelo, { x: 95, y: height - 95, size: 10, font });
    firstPage.drawText(formHeaderData.numeroOS, { x: 385, y: height - 66, size: 10, font });
    firstPage.drawText(formHeaderData.numeroSerie, { x: 385, y: height - 80, size: 10, font });
    firstPage.drawText(formHeaderData.dataVisita, { x: 385, y: height - 95, size: 10, font });
    firstPage.drawText(formHeaderData.versao, { x: 270, y: height - 95, size: 10, font });
    firstPage.drawText(formHeaderData.nomeTecnico, { x: 120, y: height - 800, size: 10, font });

    // Sintomas: desenhar X
    const drawIfChecked = (name, x, y) => {
      if (formData[name]) {
        firstPage.drawText('x', { x, y, size: 12, font });
      }
    };

    // Exemplo de posicionamento (x, y) — ajustar conforme necessário:
    //preanalise
    drawIfChecked('naoLiga', 356  , height - 239);
    drawIfChecked('desligaSozinho', 371, height - 253);
    drawIfChecked('ligaDesligaIntermitente', 371, height - 267);
    drawIfChecked('semImagem', 371, height - 281);
    drawIfChecked('semSom', 371, height - 295);
    //funcoes
    drawIfChecked('jogFunctionFalha', 342, height - 308);
    drawIfChecked('jogFunctionNormal', 429  , height - 308);
    //controle remoto
    drawIfChecked('controleFalha', 327  , height - 322);
    drawIfChecked('controleAusente', 389  , height - 322);
    drawIfChecked('controleNormal', 434  , height - 322);
    // cabo de força
    drawIfChecked('caboForcaFalha', 327  , height - 336);
    drawIfChecked('caboForcaAusente', 388  , height - 336);
    drawIfChecked('caboForcaNormal', 434  , height - 336);

    drawIfChecked('caboOneConnectFalha', 327  , height - 349);
    drawIfChecked('caboOneConnectAusente', 388  , height - 350);
    drawIfChecked('caboOneConnectNormal', 434  , height - 350);

    //imagem -test pattern
    drawIfChecked('pixelApagado', 345, height - 367);
    drawIfChecked('impurezas', 345, height - 380);
    drawIfChecked('partesEscuras', 345, height - 395);
    drawIfChecked('burnIn', 345, height - 408);
    drawIfChecked('linhasHorizontais', 345, height - 423);
    drawIfChecked('linhasVerticais', 345, height - 435);
    //imagem em todas as entradas

    drawIfChecked('rfFalha', 342, height - 464);
    drawIfChecked('rfNormal', 428, height - 464);

    drawIfChecked('hdmi1nok', 329, height - 451);
    drawIfChecked('hdmi2nok', 358, height - 451);
    drawIfChecked('hdmi3nok', 388, height - 451);
    drawIfChecked('hdmi4nok', 418, height - 451);


    //audio
    drawIfChecked('somIntermitente', 344, height - 481);
    drawIfChecked('somDistorcido', 345, height - 495);
    
    drawIfChecked('srfFalha', 342, height - 523);
    drawIfChecked('srfNormal', 428, height - 523);

    drawIfChecked('shdmi1nok', 329, height - 510);
    drawIfChecked('shdmi2nok', 358, height - 510);
    drawIfChecked('shdmi3nok', 388, height - 510);
    drawIfChecked('shdmi4nok', 418, height - 510);

    // internet
    drawIfChecked('internetCabo', 342, height - 540);
    drawIfChecked('internetWifi', 342, height - 553);
    drawIfChecked('netflix', 342, height - 568);
    drawIfChecked('youtube', 342, height - 581);

    // (e os outros conforme o layout do PDF)


    if (observacoes) {
//      firstPage.drawText(observacoes, { x: 55, y: height-755, size: 10, font });

      const maxLineLength = 74; // Máximo de caracteres por linha
      const lines = observacoes.match(new RegExp('.{1,' + maxLineLength + '}', 'g'));
      let startY = height - 755;
    
      lines.forEach((line, idx) => {
        firstPage.drawText(line, { x: 55, y: startY - (idx * 15), size: 10, font });
      });
    }

    // Assinatura
    if (!signatureRef.current.isEmpty()) {
      const signatureDataUrl = signatureRef.current.getCanvas().toDataURL('image/png');
      const signatureImageBytes = await fetch(signatureDataUrl).then(res => res.arrayBuffer());
      const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
      const signatureDims = signatureImage.scale(0.25);
      firstPage.drawImage(signatureImage, {
        x: 385,
        y: height-815,
        width: signatureDims.width,
        height: signatureDims.height,
      });
    }

    const pdfBytes = await pdfDoc.save();
    saveAs(new Blob([pdfBytes], { type: 'application/pdf' }), `${formHeaderData.numeroOS || 'checklist'}.pdf`);
  };

  return (
    <div style={styles.container}>
      <h1>Checklist DTV Atendimento Balcão</h1>

      {/* Inputs */}
      <input name="cliente" placeholder="Cliente" onChange={handleHeaderChange} value={formHeaderData.cliente} style={styles.input} />
      <input name="modelo" placeholder="Modelo" onChange={handleHeaderChange} value={formHeaderData.modelo} style={styles.input} />
      <input name="versao" placeholder="Versão" onChange={handleHeaderChange} value={formHeaderData.versao} style={styles.input} />
      <input name="numeroOS" placeholder="Número OS" onChange={handleHeaderChange} value={formHeaderData.numeroOS} style={styles.input} />
      <input name="numeroSerie" placeholder="Número de Série" onChange={handleHeaderChange} value={formHeaderData.numeroSerie} style={styles.input} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <input
  type="file"
  accept="image/*"
  capture="environment"
  style={{ display: 'none' }}
  ref={fileInputRef}
  onChange={handleFileUpload}
/>
<button
  type="button"
  onClick={() => fileInputRef.current.click()}
>
  📷 Escanear Código
</button>
</div>

<div id="reader" style={{ width: '300px', marginTop: '1rem' }}></div>
      <input type= "date" name="dataVisita" placeholder="Data Visita" onChange={handleHeaderChange} value={formHeaderData.dataVisita} style={styles.input} />
      <input name="nomeTecnico" placeholder="Nome do Técnico" onChange={handleHeaderChange} value={formHeaderData.nomeTecnico} style={styles.input} />

      {/* Seleção Bloco */}
      <select onChange={handleBlockChange} value={selectedBlock} style={styles.select}>
        <option value="">Selecione o Bloco</option>
        {Object.keys(blocos).map(bloco => (
          <option key={bloco} value={bloco}>{bloco}</option>
        ))}
      </select>

      {/* Checkboxes */}
      {selectedBlock && (
        <div style={{ marginTop: '10px' }}>
          {Object.entries(blocos[selectedBlock]).map(([section, items]) => (
            <div key={section}>
              <h3>{section}</h3>
              {items.map(item => (
                <div key={item.name}>
                  <label>
                    <input type="checkbox" name={item.name} checked={!!formData[item.name]} onChange={handleChange} />
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Observações */}
      <textarea
        placeholder="Digite observações"
        value={observacoes}
        onChange={(e) => setObservacoes(e.target.value)}
        style={styles.textarea}
      />

      {/* Assinatura */}
      <h3 style={{ textAlign: 'center', marginTop: '20px' }}>Área de Assinatura</h3>
<div style={{
  border: '2px solid #000',
  borderRadius: '8px',
  padding: '10px',
  marginTop: '10px',
  backgroundColor: '#fff'
}}>
  <SignatureCanvas
    penColor="black"
    canvasProps={{ width: 580, height: 150 }}
    ref={signatureRef}
    style={{ width: '100%', height: '150px', borderRadius: '8px', backgroundColor: '#fff' }}
  />
</div>


      {/* Botões */}
      <div style={{ marginTop: '20px' }}>
        <button onClick={generatePDF} style={styles.buttonPrimary}>Gerar PDF</button>
        <button onClick={clearSignature} style={styles.buttonSecondary}>Limpar Assinatura</button>
        <button onClick={clearAll} style={styles.buttonDanger}>Limpar Tudo</button>
      </div>
    </div>
  );
}


export default App;