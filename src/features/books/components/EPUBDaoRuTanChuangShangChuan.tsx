// @审计已完成
// EPUB 导入弹窗 - 上传子组件

import { useState } from 'react';
import { EPUBDaoRuTanChuangShangChuanBiaoDan } from './EPUBDaoRuTanChuangShangChuanBiaoDan';
import { EPUBDaoRuTanChuangShangChuanWenJian } from './EPUBDaoRuTanChuangShangChuanWenJian';
import { jieXiEPUBYuanShuJu } from '@shared/utils/epubParser';

interface EPUBDaoRuTanChuangShangChuanProps {
  darkMode: boolean;
  loading: boolean;
  error: string | null;
  onFileSelected: (file: File, title: string, author: string, coverImage: string | null) => void;
  onError: (error: string) => void;
}

export function EPUBDaoRuTanChuangShangChuan({ darkMode, loading, error, onFileSelected, onError }: EPUBDaoRuTanChuangShangChuanProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [jieXiZhuangTai, setJieXiZhuangTai] = useState(false);

  const handleFileSelected = async (file: File) => {
    setSelectedFile(file);
    setJieXiZhuangTai(true);
    
    try {
      const yuanShuJu = await jieXiEPUBYuanShuJu(file);
      setTitle(yuanShuJu.title);
      setAuthor(yuanShuJu.author);
      setCoverImage(yuanShuJu.coverImage);
    } catch (error) {
      console.error('解析 EPUB 元数据失败:', error);
      const defaultTitle = file.name.replace('.epub', '');
      setTitle(defaultTitle);
      setAuthor('未知作者');
      setCoverImage(null);
    } finally {
      setJieXiZhuangTai(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedFile) {
      onError('请选择 EPUB 文件');
      return;
    }
    if (!title.trim()) {
      onError('请输入书名');
      return;
    }
    onFileSelected(selectedFile, title.trim(), author.trim() || '未知作者', coverImage);
  };

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '0.5rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
      </div>

      <EPUBDaoRuTanChuangShangChuanWenJian
        darkMode={darkMode}
        loading={loading}
        selectedFile={selectedFile}
        onFileSelected={handleFileSelected}
        onError={onError}
      />

      {selectedFile && (
        <EPUBDaoRuTanChuangShangChuanBiaoDan
          darkMode={darkMode}
          loading={loading}
          jieXiZhuangTai={jieXiZhuangTai}
          title={title}
          author={author}
          onTitleChange={setTitle}
          onAuthorChange={setAuthor}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
