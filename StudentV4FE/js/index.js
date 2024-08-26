const app = new Vue({
    el: '#app',
    data() {
        // 学籍番号の存在を確認します！
        const rulesSNo = (rule, value, callback) => {
            if (this.isEdit) {
                callback();
            }
            // Axiosを使用して確認します 
            axios.post(
                this.baseURL + 'sno/check/',
                {
                    sno: value,
                }
            )
                .then((res) => {
                    // リクエストが成功した場合
                    if (res.data.code === 1) {
                        if (res.data.exists) {
                            callback(new Error("学籍番号が存在しています！"));
                        } else {
                            callback();
                        }
                    } else {
                        // リクエストが失敗した場合
                        callback(new Error("学籍番号のチェックエンドバックエンド異常！"))
                    }
                })
                .catch((err) => {
                    // リクエストが失敗した場合、コンソールに出力します
                    console.log(err);
                });
        }
        return {
            students: [],      // すべての学生情報
            pageStudents: [],  // ページング後の現在のページの学生
            baseURL: "http://192.168.138.129:8000/", // ここでスラッシュを追加してください
            inputStr: '', //検索条件を入力します
            selectStudents: [], //選択したチェックボックスの選択を保存する
            //====ページング関連変数====
            total: 0,          // データの総行数
            currentpage: 1,    // 現在のページ
            pagesize: 10,      // 1ページあたりの行数
            //=====ダイアログフォーム=====
            dialogVisible: false,//ダイアログの表示を制御します
            dialogTitle: "",//ダイアログのタイトル
            isView: false,//表示するかどうかを示すフラグ、trueの場合、内容は変更できません
            isEdit: false,//変更するかどうかを示すフラグ、trueの場合、内容は変更できません
            studentForm: {//ダイアログフォームの関連データをバインドします
                sno: '',
                name: '',
                gender: '',
                birthday: '',
                mobile: '',
                email: '',
                address: '',
                image: '',
            },
            rules: {
                sno: [
                    { required: true, message: '学籍番号は空白にできません', trigger: 'blur' },
                    { pattern: /^[9][5]\d{3}$/, message: '学籍番号は95で始まる5桁が必要です', trigger: 'blur' },
                    { validator: rulesSNo, trigger: 'blur' }, //学籍番号の存在を確認します！
                ],
                name: [
                    { required: true, message: '名前は空白にできません', trigger: 'blur' },
                    { pattern: /^[\u4e00-\u9fa5]{2,6}$/, message: '名前は2〜6文字の漢字でなければなりません', trigger: 'blur' },
                ],
                gender: [
                    { required: true, message: '性別は空白にできません', trigger: 'change' },
                ],
                birthday: [
                    { required: true, message: '生年月日は空白にできません', trigger: 'change' },
                ],
                mobile: [
                    { required: true, message: '携帯番号は空白にできません', triggler: 'blur' },
                    { pattern: /^[01]\d{10}$/, message: '携帯電話番号は仕様に準拠する必要があります', trigger: 'blur' },
                ],
                email: [
                    { required: true, message: 'メールアドレスを空にすることはできません', trigger: 'blur' },
                    { pattern: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, message: 'メールアドレスは仕様に準拠する必要があります', trigger: 'blur' },
                ],
                address: [
                    { required: true, message: '住所を空にすることはできません', trigger: 'blur' },
                ]
            }
        }
    },
    mounted() {
        // 自動でデータを読み込む
        this.getStudents();
    },
    methods: {
        // 学生情報を取得する
        getStudents: function () {
            let that = this;
            // Axiosを使用してAjaxリクエストを実現する
            axios
                .get(that.baseURL + "students/")
                .then(function (res) {
                    // リクエストが成功したら、関数を実行します
                    if (res.data.code === 1) {
                        // データを学生に設定します
                        that.students = res.data.data;
                        // 返されたレコードの総数を取得します
                        that.total = res.data.data.length;
                        // 現在のページのデータを取得します
                        that.getPageStudents();
                        // メッセージを表示します
                        that.$message({
                            message: '操作は成功しました',
                            type: 'success'
                        });
                    } else {
                        that.$message.error(res.data.msg);
                    }
                })
                .catch(function (err) {
                    // リクエストが失敗したら、関数を実行します
                    console.log(err);
                });
        },
        //すべての学生情報を表示
        getAllStudents() {
            //入力されたinputStrをクリアする
            this.inputStr = "";
            //すべてのデータを取得する
            this.getStudents();
        },
        getPageStudents() {
            // 現在のページのデータ配列をクリアします
            this.pageStudents = [];
            for (let i = (this.currentpage - 1) * this.pagesize; i < this.total; i++) {
                // データをpageStudentsに追加します
                this.pageStudents.push(this.students[i]);
                // 1ページの要件を満たしているかどうかを確認します
                if (this.pageStudents.length === this.pagesize) break;
            }
        },
        //学生情報の検索を実現
        queryStudents() {
            // Ajaxリクエストを使用して、InputStrを渡します
            let that = this
            // Ajaxリクエストを開始します
            axios
                .post(
                    that.baseURL + "students/query/",
                    {
                        inputstr: that.inputStr,
                    }
                ).then(function (res) {
                    if (res.data.code === 1) {
                        // データをstudentsに設定します
                        that.students = res.data.data;
                        // 返されたレコードの総数を取得します
                        that.total = res.data.data.length;
                        // 現在のページのデータを取得します
                        that.getPageStudents();
                        // メッセージを表示します：
                        that.$message({
                            message: 'データが正常にロードされました！',
                            type: 'success'
                        });
                    } else {
                        // 失敗した場合のメッセージ：
                        that.$message.error(res.data.msg);
                    }
                })
                .catch(function (err) {
                    console.log(err);
                    that.$message.error("バックエンド検索結果の取得中に例外が発生しました。");
                });
        },
        // 学生を追加する際にフォームを開きます
        addStudent() {
            // タイトルを変更します
            this.dialogTitle = "学生の詳細情報を追加する";
            // フォームを表示します
            this.dialogVisible = true;
        },
        // Idに基づいて画像を取得します
        getImageBySno(sno) {
            // ループします
            for (oneStudent of this.students) {
                // 条件を判断します
                if (oneStudent.sno == sno) {
                    return oneStudent.image;
                }
            }
        },
        // 学生の詳細を表示します
        viewStudent(row) {
            // タイトルを変更します
            this.dialogTitle = "学生の詳細情報を確認する";
            // isView変数を変更します
            this.isView = true;
            // フォームを表示します
            this.dialogVisible = true;
            // 深いコピーの方法
            this.studentForm = JSON.parse(JSON.stringify(row))
            // 画像を取得します
            this.studentForm.image = this.getImageBySno(row.sno);
            // 画像のURLを取得します
            this.studentForm.imageUrl = this.baseURL + 'media/' + this.studentForm.image;
        },
        // 学生の詳細を更新します
        updateStudent(row) {
            // タイトルを変更します
            this.dialogTitle = "学生の詳細情報を修正する";
            // isEdit変数を変更します
            this.isEdit = true;
            // フォームを表示します
            this.dialogVisible = true;
            // 深いコピーの方法
            this.studentForm = JSON.parse(JSON.stringify(row))
            // 画像を取得します
            this.studentForm.image = this.getImageBySno(row.sno);
            // 画像のURLを取得します
            this.studentForm.imageUrl = this.baseURL + 'media/' + this.studentForm.image;
        },
        // 学生のフォームを送信します（追加、更新）
        submitStudentForm(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    // 検証が成功した場合、追加または更新を実行します
                    if (this.isEdit) {
                        // 更新
                        this.submitUpdateStudent();
                    } else {
                        // 追加
                        this.submitAddStudent();
                    }
                } else {
                    console.log('error submit!!');
                    return false;
                }
            });
        },
        // データベースに学生を追加します
        submitAddStudent() {
            // 'that'を定義します
            let that = this;
            // Axiosリクエストを実行します
            axios
                .post(that.baseURL + 'student/add/', that.studentForm)
                .then(res => {
                    // 成功した場合
                    if (res.data.code === 1) {
                        // 全ての学生情報を取得します
                        that.students = res.data.data;
                        // レコード数を取得します
                        that.total = res.data.data.length;
                        // ページング情報を取得します
                        that.getPageStudents();
                        // メッセージを表示します
                        that.$message({
                            message: 'データが正常に追加されました！',
                            type: 'success'
                        });
                        // ダイアログを閉じます
                        this.closeDialogForm('studentForm');
                    } else {
                        // 失敗した場合のメッセージ
                        that.$message.error(res.data.msg);
                    }
                })
                .catch(err => {
                    // 失敗した場合
                    console.log(err);
                    that.$message.error("バックエンドからデータを取得する際にエラーが発生しました。");
                })
        },
        // データベースを更新します
        submitUpdateStudent() {
            // 'that'を定義します
            let that = this;
            // Axiosリクエストを実行します
            axios
                .post(that.baseURL + 'student/update/', that.studentForm)
                .then(res => {
                    // 成功した場合
                    if (res.data.code === 1) {
                        // 全ての学生情報を取得します
                        that.students = res.data.data;
                        // レコード数を取得します
                        that.total = res.data.data.length;
                        // ページング情報を取得します
                        that.getPageStudents();
                        // メッセージを表示します
                        that.$message({
                            message: 'データが正常に変更されました。',
                            type: 'success'
                        });
                        // ダイアログを閉じます
                        this.closeDialogForm('studentForm');
                    } else {
                        // 失敗した場合のメッセージ
                        that.$message.error(res.data.msg);
                    }
                })
                .catch(err => {
                    // 失敗した場合
                    console.log(err);
                    that.$message.error("バックエンドからデータを取得する際にエラーが発生しました。");
                })
        },
        // 学生レコードを削除します
        deleteStudent(row) {
            // 確認の待機
            this.$confirm('【学籍番号：' + row.sno + '\t名前：' + row.name + '】の情報を削除しますか',
                '確認', {
                confirmButtonText: '削除する',
                cancelButtonText: 'キャンセル',
                type: 'warning'
            }).then(() => {
                // 削除を確認した場合
                let that = this
                // バックエンドAPIを呼び出します
                axios.post(that.baseURL + 'student/delete/', { sno: row.sno })
                    .then(res => {
                        if (res.data.code === 1) {
                            // 全ての学生情報を取得します
                            that.students = res.data.data;
                            // レコード数を取得します
                            that.total = res.data.data.length;
                            // ページング情報を取得します
                            that.getPageStudents();
                            // メッセージを表示します
                            that.$message({
                                message: 'データの削除が成功しました。',
                                type: 'success'
                            });
                        } else {
                            that.$message.error(res.data.msg);
                        }
                    })
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '削除をキャンセルしました'
                });
            });
        },
        // 複数の学生レコードを削除します
        deleteStudents() {
            // 確認の待機
            this.$confirm("一括で" + this.selectStudents.length + "条目の学生情報を削除してもよろしいですか？",
                '確認', {
                confirmButtonText: '削除する',
                cancelButtonText: 'キャンセル',
                type: 'warning'
            }).then(() => {
                // 削除を確認した場合
                let that = this
                // バックエンドAPIを呼び出します
                axios.post(that.baseURL + 'students/delete/', { student: that.selectStudents })
                    .then(res => {
                        if (res.data.code === 1) {
                            // 全ての学生情報を取得します
                            that.students = res.data.data;
                            // レコード数を取得します
                            that.total = res.data.data.length;
                            // ページング情報を取得します
                            that.getPageStudents();
                            // メッセージを表示します
                            that.$message({
                                message: 'データの一括削除に成功しました！',
                                type: 'success'
                            });
                        } else {
                            that.$message.error(res.data.msg);
                        }
                    })
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '削除をキャンセルしました'
                });
            });
        },
        // フォームをリセットします
        resetForm(formName) {
            this.$refs[formName].resetFields();
        },
        // ダイアログのフォームを閉じます
        closeDialogForm() {
            this.studentForm.sno = "";
            this.studentForm.name = "";
            this.studentForm.gender = "";
            this.studentForm.birthday = "";
            this.studentForm.mobile = "";
            this.studentForm.email = "";
            this.studentForm.address = "";
            this.studentForm.image = "",
                this.studentForm.imageUrl = "",
                // 閉じます
                this.dialogVisible = false;
            // isViewとisEditの値を初期化します
            this.isView = false;
            this.isEdit = false;
        },
        // アバターをアップロードした後に実行されるイベント
        uploadPicturePost(file) {
            // 'that'を定義します
            let that = this;
            // FormDataクラスを定義します
            let fileReq = new FormData();
            // 画像を追加します
            fileReq.append('avatar', file.file);
            // Axiosを使用してAjaxリクエストを発行します
            axios(
                {
                    method: 'post',
                    url: that.baseURL + 'upload/',
                    data: fileReq
                }
            ).then(res => {
                // codeに基づいて成功を判断します
                if (res.data.code === 1) {
                    // 画像をstudentFormに設定します
                    that.studentForm.image = res.data.name;
                    // imageurlを組み立てます
                    that.studentForm.imageUrl = that.baseURL + "media/" + res.data.name;
                } else {
                    // 失敗のメッセージを表示します
                    that.$message.error(res.data.msg);
                }
            }).catch(err => {
                console.log(err);
                that.$message.error("アバターのアップロード中に例外が発生しました！");
            })
        },
        // Excelファイルをインポートします
        uploadExcelPost(file) {
            let that = this
            // FormDataクラスをインスタンス化します
            let fileReq = new FormData();
            // ファイルを追加します
            fileReq.append('excel', file.file);
            // Axiosを使用してAjaxリクエストを発行します
            axios(
                {
                    method: 'post',
                    url: that.baseURL + 'excel/import/',
                    data: fileReq
                }
            ).then(res => {
                // codeに基づいて成功を判断します
                if (res.data.code === 1) {
                    // 学生情報を更新します
                    that.students = res.data.data;
                    // 合計のレコード数を計算します
                    that.total = res.data.data.length;
                    // ページングを行います
                    that.getPageStudents();
                    // アラートを表示します
                    this.$alert('データ導入完了しました! 成功：' + res.data.success + '失敗：' + res.data.error
                        , '導入した結果を示す', {
                        confirmButtonText: '確認',
                        callback: action => {
                            this.$message({
                                type: 'info',
                                message: "データ導入失敗数は：" + res.data.error + ",学籍番号：" + res.data.errors,
                            });
                        }
                    });
                    // 失敗の明細を出力します
                    console.log("データ導入失敗数は：" + res.data.error + ",学籍番号：");
                    console.log(res.data.errors);
                } else {
                    // 失敗のメッセージを表示します
                    that.$message.error(res.data.msg);
                }
            }).catch(err => {
                console.log(err);
                that.$message.error("Excelのアップロード時に例外が発生する！");
            })
        },
        // Excelファイルをエクスポートします
        exportToExcel() {
            let that = this
            axios.get(that.baseURL + 'excel/export/')
                .then(res => {
                    if (res.data.code === 1) {
                        // 完全なExcelのURLを組み立てます
                        let url = that.baseURL + 'media/' + res.data.name;
                        // ダウンロードします
                        window.open(url);
                    } else {
                        that.$message.error("Excel のダンロードに例外が発生しました。");
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        },
        // ページング時に表示されるレコード数を変更します
        handleSizeChange(size) {
            // 現在のページに表示されるデータ行数を変更します
            this.pagesize = size;
            // ページングデータを再取得します
            this.getPageStudents();
        },
        // handleCurrentChangeメソッドを追加します
        handleCurrentChange(page) {
            this.currentpage = page;
            this.getPageStudents();
        },
        // チェックボックスが選択されたときの操作
        handleSelectionChange(data) {
            this.selectStudents = data;
            console.log(data);
        },
    },
})