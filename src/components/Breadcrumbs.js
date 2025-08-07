// import React from 'react';
// import { useNavigate } from 'react-router-dom';

// const Breadcrumbs = ({ path }) => {
//   const navigate = useNavigate();

//   return (
//     <nav aria-label="breadcrumb">
//       <ol className="breadcrumb bg-white rounded shadow-sm p-3 mb-4">
//         <li className="breadcrumb-item">
//           <button onClick={() => navigate('/')} className="btn btn-link text-decoration-none p-0">Home</button>
//         </li>
//         {path.map((step, index) => (
//           <li
//             key={index}
//             className={`breadcrumb-item ${index === path.length - 1 ? 'active' : ''}`}
//             aria-current={index === path.length - 1 ? 'page' : undefined}
//           >
//             {index === path.length - 1 ? (
//               step.name
//             ) : (
//               <button
//                 className="btn btn-link text-decoration-none p-0"
//                 onClick={() => navigate(`/${step.page}`)}
//               >
//                 {step.name}
//               </button>
//             )}
//           </li>
//         ))}
//       </ol>
//     </nav>
//   );
// };

// export default Breadcrumbs;

import React from 'react';
import { useNavigate } from 'react-router-dom';

const Breadcrumbs = ({ path }) => {
  const navigate = useNavigate();

  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb bg-white rounded shadow-sm p-3 mb-4">
        {/* The first breadcrumb is now "Dashboard" as per your previous request. */}
        <li className="breadcrumb-item">
          <button onClick={() => navigate('/')} className="btn btn-link text-decoration-none p-0">Dashboard</button>
        </li>
        {path.map((step, index) => (
          <li
            key={index}
            className={`breadcrumb-item ${index === path.length - 1 ? 'active' : ''}`}
            aria-current={index === path.length - 1 ? 'page' : undefined}
          >
            {index === path.length - 1 ? (
              step.name
            ) : (
              <button
                className="btn btn-link text-decoration-none p-0"
                onClick={() => navigate(`/${step.page}`)}
              >
                {step.name}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
