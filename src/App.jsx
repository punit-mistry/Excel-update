import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';

function ExcelUploader() {
  const [data, setData] = useState([]);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryString = e.target.result;
      const workbook = XLSX.read(binaryString, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      setData(excelData);
    };
    reader.readAsBinaryString(file);
  };

  const exportToCSV = () => {
    const csvData = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const addUsedTo = (rowIndex) => {
    const updatedData = [...data];
    updatedData[0] = [...updatedData[rowIndex], 'Status'];
    updatedData[rowIndex] = [...updatedData[rowIndex], 'Used'];
    setData(updatedData);
  };

  const removeUsed = (rowIndex) => {
    const updatedData = [...data];
    const row = updatedData[rowIndex];
    const indexOfUsed = row.indexOf('Used');
    if (indexOfUsed !== -1) {
      row.splice(indexOfUsed, 1);
      setData(updatedData);
    }
  };
  
  return (
    <div className="max-w-screen-lg mx-auto p-4 bg-white rounded-md shadow-lg">
      <div {...getRootProps()} className="border-2 border-dashed border-gray-400 h-56 flex items-center justify-center p-4 text-center cursor-pointer mb-4">
        <input {...getInputProps()} />
        <p>Drag 'n' drop an Excel file here, or click to select one</p>
      </div>
      <table className="w-full border-collapse border border-gray-400">
        <thead>
          <tr className="bg-gray-200">
            {data.length > 0 && data[0].map((cell, index) => <th key={index} className="border border-gray-400 p-2">{cell}</th>)}
            <th>
              <button onClick={exportToCSV} className="bg-green-500 text-white p-2 ml-2">Export to CSV</button>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.slice(1).map((row, rowIndex) => (
            <tr key={rowIndex} className="odd:bg-gray-100">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="border border-gray-400 p-2">{cell}</td>
              ))}
              <td className="border border-gray-400 p-2">
                {data[rowIndex + 1].includes('Used') ? (
                  <button className='bg-red-500 text-white p-2' onClick={() => removeUsed(rowIndex + 1)}>Remove Used</button>
                ) : (
                  <button className='bg-blue-500 text-white p-2' onClick={() => addUsedTo(rowIndex + 1)}>Add Used</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExcelUploader;
