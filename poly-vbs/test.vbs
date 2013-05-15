Class Ugly
	Private mFoo
	Private mOnEnd
	Private Sub Class_Initialize
		mFoo = "wicked fugly!"
	End Sub
	Public Default Property Get foo
		foo = mFoo
	End Property
	Public Function toString
		toString = "[object Date]"
	End Function
	Private Sub Class_Terminate
		MsgBox "Ended"
		'If Not (mOnEnd Is Empty) Then
		Call mOnEnd.cb()
	End Sub
	Public Property Set onEnd (ByRef val)
		Set mOnEnd = val
	End Property
End Class

Function getUgly
	Set getUgly = New Ugly
End Function

Function setUglyCallback (ugly, obj)
	Set ugly.onEnd = obj
End Function

Dim test
Set test = New Ugly
If TypeName(test) = "Ugly" Then MsgBox "Yes!"