"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { ref, onValue, push, update, remove } from "firebase/database";

interface Company {
  id: string;
  companyName: string;
  phoneNumber: string;
}

export default function CompanyForm() {
  const [companyName, setCompanyName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [editId, setEditId] = useState<string | null>(null); // 수정 모드

  // 실시간 DB 감시
  useEffect(() => {
    const companiesRef = ref(db, "companies");
    const unsubscribe = onValue(companiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.entries(data).map(([key, value]: any) => ({
          id: key,
          companyName: value.companyName,
          phoneNumber: value.phoneNumber,
        }));
        setCompanies(formatted);
      } else {
        setCompanies([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!auth.currentUser) {
      alert("로그인 후 사용하세요.");
      return;
    }
    if (!companyName || !phoneNumber) {
      alert("회사명과 전화번호를 입력하세요.");
      return;
    }

    setLoading(true);
    try {
      const companiesRef = ref(db, "companies");

      if (editId) {
        // 수정
        await update(ref(db, `companies/${editId}`), {
          companyName,
          phoneNumber,
        });
        setEditId(null); // 수정 완료 후 초기화
      } else {
        // 새로 저장
        await push(companiesRef, {
          companyName,
          phoneNumber,
          createdAt: new Date().toISOString(),
        });
      }

      // 입력 초기화
      setCompanyName("");
      setPhoneNumber("");
    } catch (error) {
      console.error(error);
      alert("저장 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (company: Company) => {
    setCompanyName(company.companyName);
    setPhoneNumber(company.phoneNumber);
    setEditId(company.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await remove(ref(db, `companies/${id}`));
    } catch (error) {
      console.error(error);
      alert("삭제 중 오류 발생");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* 입력 폼 */}
      <div className="p-4 border rounded shadow mb-4">
        <label className="block mb-2">
          회사명
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="border rounded p-2 w-full"
          />
        </label>

        <label className="block mb-2">
          전화번호
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="border rounded p-2 w-full"
          />
        </label>

        <button
          onClick={handleSave}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          disabled={loading}
        >
          {loading ? "저장 중..." : editId ? "수정" : "저장"}
        </button>
      </div>

      {/* 미리보기 리스트 */}
      <div className="p-4 border rounded shadow">
        <h3 className="font-bold mb-2">저장된 회사 미리보기</h3>
        {companies.length > 0 ? (
          companies.map((c) => (
            <div key={c.id} className="flex justify-between items-center border-b py-1">
              <div>
                <span className="font-medium">{c.companyName}</span>{" "}
                <span className="text-gray-500">{c.phoneNumber}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(c)}
                  className="px-2 py-1 bg-yellow-400 text-white rounded text-sm"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        ) : (
          <div>저장된 회사가 없습니다.</div>
        )}
      </div>
    </div>
  );
}