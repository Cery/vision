document.addEventListener('DOMContentLoaded', function() {
    var supplierModal = document.getElementById('supplierModal');
    if (supplierModal) {
        supplierModal.addEventListener('show.bs.modal', function (event) {
            // 触发模态框的按钮
            var button = event.relatedTarget;

            // 从data-*属性中提取信息
            var title = button.getAttribute('data-supplier-title');
            var address = button.getAttribute('data-supplier-address');
            var type = button.getAttribute('data-supplier-type');
            var contactPerson = button.getAttribute('data-supplier-contact-person');
            var phone = button.getAttribute('data-supplier-phone');
            var email = button.getAttribute('data-supplier-email');
            var content = button.getAttribute('data-supplier-content');

            // 更新模态框的内容
            var modalTitle = supplierModal.querySelector('.modal-title');
            var modalBodyAddress = supplierModal.querySelector('#supplier-address');
            var modalBodyType = supplierModal.querySelector('#supplier-type');
            var modalBodyContactPerson = supplierModal.querySelector('#supplier-contact-person');
            var modalBodyPhone = supplierModal.querySelector('#supplier-phone');
            var modalBodyEmail = supplierModal.querySelector('#supplier-email');
            var modalBodyDescription = supplierModal.querySelector('#supplier-description');

            modalTitle.textContent = title;
            modalBodyAddress.textContent = address || 'N/A';
            modalBodyType.textContent = type || 'N/A';
            modalBodyContactPerson.textContent = contactPerson || 'N/A';
            modalBodyPhone.textContent = phone || 'N/A';
            modalBodyEmail.textContent = email || 'N/A';
            modalBodyDescription.innerHTML = content || '暂无详细介绍。';
        });
    }
});