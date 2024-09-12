import { SWRConfig } from "swr";

// components
import Router from "./pages/Router";

// helpers
import { SWR_CONFIG } from "./swr/swr.config";

function App() {
  return (
    <SWRConfig value={SWR_CONFIG}>
      <div className="App" data-testid="react-root-component">
        <Router />
      </div>
    </SWRConfig>
  );
}

export default App;
