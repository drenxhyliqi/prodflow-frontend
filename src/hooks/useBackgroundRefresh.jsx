import { useEffect, useRef } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const TOAST_ID = 'background-refresh';

export function useBackgroundRefresh(enabled = true) {
    const lastStatus = useRef('idle');

    useEffect(() => {
        if (!enabled) return;

        const poll = async () => {
            try {
                const { data } = await api.get('/admin/analytics/refresh-status');

                if (data.refreshing || data.status === 'processing') {
                    toast.info(data.message, {
                        toastId: TOAST_ID,
                        autoClose: false,
                        icon: '⏳',
                    });
                    lastStatus.current = 'processing';
                    return;
                }

                if (data.status === 'completed' && lastStatus.current === 'processing') {
                    toast.dismiss(TOAST_ID);
                    toast.success(data.message, { autoClose: 3000 });
                    lastStatus.current = 'completed';
                    return;
                }

                if (data.status === 'failed') {
                    toast.dismiss(TOAST_ID);
                    toast.error(data.message, { autoClose: 5000 });
                    lastStatus.current = 'failed';
                    return;
                }

                if (lastStatus.current !== 'idle') {
                    toast.dismiss(TOAST_ID);
                    lastStatus.current = 'idle';
                }
            } catch {
                // ignore polling errors
            }
        };

        poll();
        const interval = setInterval(poll, 2000);
        return () => {
            clearInterval(interval);
            toast.dismiss(TOAST_ID);
        };
    }, [enabled]);
}