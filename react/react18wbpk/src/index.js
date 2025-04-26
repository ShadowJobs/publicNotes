import React from 'react';
import ReactDOM from 'react-dom';
import A from '@/comps/A';
import B from '@/comps/B';

function App() {
    return <div>
      <A />
        <h1>Hello, React 18!</h1>
      <B v='b des'/>
    </div>
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
