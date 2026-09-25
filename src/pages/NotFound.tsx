import { Link } from 'react-router-dom';
import { EmptyState } from '../components/common';

export default function NotFound() {
  return (
    <EmptyState
      icon="🧭"
      title="这个页面不存在"
      desc="可能是链接输错了，回到首页重新出发吧。"
      action={
        <Link className="btn btn--primary" to="/">
          返回首页
        </Link>
      }
    />
  );
}
