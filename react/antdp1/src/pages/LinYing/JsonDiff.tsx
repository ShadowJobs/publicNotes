
import ErrorBoundary from '@/components/ErrorBoundary';
import diff from 'json-diff';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';
const TestBoundary:React.FC<{}>=()=>{
  JSON.parse("a")
  return <>aaa</>
}
const Tool = ({ oldJson, newJson }) => {
  const diffStr = diff.diffString(oldJson, newJson);
  return (
    <SyntaxHighlighter language="diff" style={solarizedlight}>
      {diffStr}
    </SyntaxHighlighter>
  );
};

const JsonDiff=({}) => {
  let oldjson={"A":1,"B":2,"E":5,"F":{"F1":[1,2]},"G":{"G1":[3]},"H":{F1:[1,2]}}
  let newjson={"A":1,"B":3,"C":4,"H":{"F1":[2,3]},"G":{"G1":{G2:5}}}
  return <>
    <Tool oldJson={oldjson} newJson={newjson}/>
    <ErrorBoundary title="aaaa">
      <TestBoundary/>
    </ErrorBoundary>
  </>
}

export default JsonDiff;
