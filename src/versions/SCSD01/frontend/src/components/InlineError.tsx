import React from 'react';

export function InlineError(props: { message: string }): JSX.Element {
  return (
    <div role="alert" style={{ color: '#b42318', marginTop: 8 }}>
      {props.message}
    </div>
  );
}

