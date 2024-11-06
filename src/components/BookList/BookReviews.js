import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { GET_BOOK_REVIEWS_API_URL } from '../../util/apiUrl';
import './BookDetail.css';

const BookReviews = () => {
  const { bookId } = useParams(); // bookId를 여기서 가져옵니다.
  console.log('Fetched bookId:', bookId); // 콘솔에 bookId 출력
  const [reviews, setReviews] = useState([]); // 리뷰 상태 초기화
  const [loading, setLoading] = useState(true); // 로딩 상태 초기화
  const [error, setError] = useState(null); // 에러 상태 초기화

  useEffect(() => {
    fetchReviews(); // bookId가 변경될 때마다 리뷰를 가져오는 함수 호출
  }, [bookId]);

  const fetchReviews = async () => {
    if (!bookId) {
      // bookId가 유효한지 확인
      setError('유효하지 않은 책 ID입니다.'); // 에러 메시지 설정
      setLoading(false); // 로딩 해제
      return; // 함수 종료
    }

    setLoading(true); // 데이터 요청 시작 시 로딩 상태 설정
    setError(null); // 이전 에러 상태 초기화

    try {
      const response = await axios.get(GET_BOOK_REVIEWS_API_URL(bookId)); // API 호출
      console.log('Fetched reviews:', response.data); // 가져온 데이터 콘솔에 출력
      setReviews(response.data); // 가져온 리뷰 데이터를 상태에 저장
    } catch (error) {
      console.error('Error fetching book reviews:', error); // 에러 콘솔에 출력
      setError('리뷰를 가져오는 중 오류가 발생했습니다.'); // 에러 메시지 상태 설정
    } finally {
      setLoading(false); // 데이터 요청 완료 후 로딩 상태 해제
    }
  };

  if (loading) return <p>로딩 중...</p>; // 로딩 중일 때 메시지 출력
  if (error) return <p>{error}</p>; // 에러가 있을 경우 에러 메시지 출력

  return (
    <div>
      <div className="book-review-list">
        <h2>Book Reviews</h2>
        {reviews.length > 0 ? ( // 리뷰가 있는지 체크
          <ul>
            {reviews.map((review, index) => (
              <li key={index}>
                <h3>{review.member_nickname}</h3> {/* 리뷰 작성자의 별명 */}
                <p>{review.review_content}</p> {/* 리뷰 내용 */}
                <p>Rating: {review.rating}</p> {/* 평점 */}
                <p>Date: {review.review_created_at}</p> {/* 작성 날짜 */}
              </li>
            ))}
          </ul>
        ) : (
          <p>No reviews available.</p> // 리뷰가 없을 경우 메시지 출력
        )}
      </div>
    </div>
  );
};
export default BookReviews;
