"use client";

interface pagination {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPage: number;
}

import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export default function Pagination({ page, setPage, totalPage }: pagination) {
  return (
    <div className='pagination'>
      <button onClick={() => setPage(1)} disabled={page === 1}>
        <ChevronDoubleLeftIcon className='icon' />
      </button>
      <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
        <ChevronLeftIcon className='icon' />
      </button>

      {[...Array(totalPage)]
        .map((_, index) => (
          <button key={index + 1} onClick={() => setPage(index + 1)} className={page === index + 1 ? "active" : ""}>
            {index + 1}
          </button>
        ))
        .slice(Math.max(0, page - 5), page + 5)}

      <button onClick={() => setPage((prev) => Math.min(prev + 1, totalPage))} disabled={page === totalPage}>
        <ChevronRightIcon className='icon' />
      </button>
      <button onClick={() => setPage(totalPage)} disabled={page === totalPage}>
        <ChevronDoubleRightIcon className='icon' />
      </button>
    </div>
  );
}
