import { Select } from '../ui';
import { GOOGLE_DRIVE_FOLDERS } from '../../../lib/constants';

interface GoogleDriveFolderSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
}

export default function GoogleDriveFolderSelector({
  value,
  onChange,
  label = 'Select Folder',
  disabled = false,
}: GoogleDriveFolderSelectorProps) {
  const options = GOOGLE_DRIVE_FOLDERS.map((folder) => ({
    value: folder.id,
    label: folder.name,
  }));

  return (
    <Select
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={options}
      placeholder="Choose a folder..."
      disabled={disabled}
    />
  );
}
