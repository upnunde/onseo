import { use } from "react";
import BuilderPageClient from "./builder-page-client";

type PageProps = {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string | string[]>>;
};

export default function Page({ params, searchParams }: PageProps) {
  // Next.js 15에서는 params / searchParams가 Promise 이므로 서버 컴포넌트에서 한 번 해제해 줍니다.
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);

  // 현재는 별도 사용하지 않지만, 추후 필요 시 클라이언트 컴포넌트로 전달할 수 있도록 props 형태 유지
  return (
    <BuilderPageClient
      initialParams={resolvedParams}
      initialSearchParams={resolvedSearchParams}
    />
  );
}