import { useState } from 'react';
import socket from '../socket';

export function MyForm() {
  const [value, setValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  function onSubmit(event) {

    event.preventDefault();
    setIsLoading(true);

    socket.timeout(5000).emit('message', value, () => {
        setIsLoading(false);
    })
  }

  return (
    <form onSubmit={ onSubmit }>
      <input onChange={ e => setValue(e.target.value) } value={ value }/>

      <button type="submit" disabled={ isLoading }>Submit</button>
    </form>
  );
}