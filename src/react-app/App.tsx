// src/App.tsx

import { useActionState } from 'react';

async function submitAttendance(
  prevState: { success: boolean; message: string } | null,
  formData: FormData,
) {
  const loginId = formData.get('login_id') as string;
  const password = formData.get('password') as string;
  const attendances = formData.get('attendances') as string;

  try {
    const response = await fetch('/api/attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        login_id: loginId,
        password: password,
        attendances: attendances,
      }),
    });

    if (response.ok) {
      return { success: true, message: 'Attendance submitted successfully' };
    }
    return { success: false, message: 'Failed to submit attendance' };
  } catch (error) {
    return { success: false, message: 'Network error occurred' };
  }
}

function App() {
  const [state, formAction, isPending] = useActionState(submitAttendance, null);

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-4'>
      <div className='max-w-2xl mx-auto bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-8'>
        <h1 className='text-3xl font-bold text-center mb-8 text-gray-100 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
          Attendance Input
        </h1>

        <form action={formAction} className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label
                htmlFor='login_id'
                className='block text-sm font-medium text-gray-300 mb-2'
              >
                Login ID
              </label>
              <input
                type='text'
                id='login_id'
                name='login_id'
                required
                className='w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-300 mb-2'
              >
                Password
              </label>
              <input
                type='password'
                id='password'
                name='password'
                required
                className='w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
              />
            </div>
          </div>

          <div>
            <label
              htmlFor='attendances'
              className='block text-sm font-medium text-gray-300 mb-2'
            >
              Attendances (JSON)
            </label>
            <textarea
              id='attendances'
              name='attendances'
              rows={16}
              required
              placeholder='{"date": "2024-01-01", "start_time": "09:00", "end_time": "18:00", ...}'
              className='w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm transition-all duration-200 resize-none'
            />
          </div>

          <button
            type='submit'
            disabled={isPending}
            className='w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
          >
            {isPending ? (
              <span className='flex items-center justify-center gap-2'>
                <svg
                  className='animate-spin h-4 w-4'
                  viewBox='0 0 24 24'
                  role='img'
                  aria-label='Loading'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                    fill='none'
                  />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  />
                </svg>
                Sending...
              </span>
            ) : (
              'Send'
            )}
          </button>
        </form>

        {state && (
          <div
            className={`mt-6 p-4 rounded-lg border transition-all duration-300 ${
              state.success
                ? 'bg-green-900/50 border-green-600/50 text-green-300'
                : 'bg-red-900/50 border-red-600/50 text-red-300'
            }`}
          >
            <div className='flex items-center gap-2'>
              {state.success ? (
                <svg
                  className='h-5 w-5 flex-shrink-0'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  role='img'
                  aria-label='Success'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                    clipRule='evenodd'
                  />
                </svg>
              ) : (
                <svg
                  className='h-5 w-5 flex-shrink-0'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  role='img'
                  aria-label='Error'
                >
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                    clipRule='evenodd'
                  />
                </svg>
              )}
              {state.message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
