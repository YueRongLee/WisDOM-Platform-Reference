/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';

// component mount階段不執行effect內的function(第一次不執行)
const useUpdateEffect = (cb, depend) => {
  const [status, setStatus] = useState(false);

  useEffect(() => {
    if (status) {
      cb();
    } else {
      setStatus(true);
    }
  }, depend);
};

export default useUpdateEffect;
