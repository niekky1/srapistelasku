import React from 'react';

export class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) {
    console.error('Render error:', error);
    console.error('Component stack:', info.componentStack);
  }
  render() {
    return this.state.error
      ? <div style={{padding:12, background:'#fee', color:'#900', fontFamily:'monospace'}}>
          Jokin meni pieleen: {this.state.error.message}
        </div>
      : this.props.children;
  }
}
