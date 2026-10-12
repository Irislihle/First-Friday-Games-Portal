import Modal from './Modal'

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  loading = false,
  error = '',
}) {
  return (
    <Modal isOpen={isOpen} onClose={loading ? () => {} : onClose} title={title}>
      <p className="text-[13px] text-muted leading-relaxed mb-4">{message}</p>

      {error && (
        <div className="text-[12.5px] text-red font-medium mb-3" role="alert">
          {error}
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-[12.5px] font-semibold text-muted hover:text-[#091f2f] disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="bg-red hover:bg-red-deep disabled:opacity-60 text-white text-[12.5px] font-bold rounded px-4 py-2 transition-colors"
        >
          {loading ? 'Working...' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}